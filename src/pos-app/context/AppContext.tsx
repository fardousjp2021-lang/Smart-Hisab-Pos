// @ts-nocheck
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  onSnapshot, 
  updateDoc, 
  deleteDoc,
  runTransaction,
  writeBatch,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { Product, Sale, StockMovement, AppUser, SupportIssue } from '../types';
import { isDisposableEmail, getDemoProductsForBusiness } from '../utils/demoData';
import { ensureWorkspaceClaim, canOpenBusinessListeners, type WorkspaceClaimStatus } from '../lib/workspaceClaim';
import { isPhase3FlagOn } from '../lib/phase3Flags';
import { scopedQuery, isNoWorkspaceQuery } from '../lib/workspaceQuery';

interface AppContextType {
  currentUser: AppUser | null;
  firebaseUser: FirebaseUser | null;
  products: Product[];
  sales: Sale[];
  stockMovements: StockMovement[];
  users: AppUser[];
  issues: SupportIssue[];
  loadingAuth: boolean;
  loadingData: boolean;
  login: () => Promise<void>;
  demoLogin: () => Promise<void>;
  isSandboxMode: boolean;
  logout: () => Promise<void>;
  
  // Auth Extra
  authError: string | null;
  clearAuthError: () => void;
  registerUser: (regData: { 
    fullName: string; 
    phone: string; 
    email: string; 
    businessType: string; 
    businessName: string; 
    message: string; 
  }) => Promise<{ success: boolean; message: string }>;

  // Theme Toggle
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Actions
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  addSale: (sale: Omit<Sale, 'id'>) => Promise<void>;
  deleteSale: (id: string) => Promise<void>; // To rollback if needed

  addStockMovement: (movement: Omit<StockMovement, 'id'>) => Promise<void>;
  
  // User Management
  toggleUserBlock: (uid: string, isBlocked: boolean) => Promise<void>;
  toggleUserAdmin: (uid: string, isAdmin: boolean) => Promise<void>;

  // Backup & Import
  importBackup: (data: { products: Product[]; sales: Sale[]; stockMovements: StockMovement[] }) => Promise<void>;

  // Support Ticket actions
  addSupportIssue: (message: string, systemStateSummary?: string) => Promise<void>;
  resolveSupportIssue: (id: string, resolutionNote?: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [issues, setIssues] = useState<SupportIssue[]>([]);
  const [isSandboxMode, setIsSandboxMode] = useState<boolean>(false);
  
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  // Phase 3 pre-flight: workspaceId custom-claim readiness gate.
  // Business-collection listeners MUST NOT open until this is 'ready' (or
  // the caller is an admin), otherwise Phase 2 rules reject them with
  // permission-denied. See docs/multi-tenant-phase3-blocker-investigation.md.
  const [workspaceClaim, setWorkspaceClaim] = useState<WorkspaceClaimStatus | null>(null);
  const [claimRefreshing, setClaimRefreshing] = useState(false);

  // Extra auth flow states
  const [authError, setAuthError] = useState<string | null>(null);
  const clearAuthError = () => setAuthError(null);

  // Theme states
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark';
    if (saved === 'dark') {
      localStorage.setItem('theme', 'light');
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme('light');
    localStorage.setItem('theme', 'light');
  };

  // Sign In with Google
  const login = async () => {
    try {
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Login error: ', error);
      const errMsg = error?.message || String(error);
      const errCode = error?.code || '';
      
      if (errCode === 'auth/unauthorized-domain' || errMsg.includes('unauthorized-domain')) {
        setAuthError(`ফায়ারবেজ ত্রুটি (Unauthorized Domain): আপনার এই ডোমেনটি (${window.location.hostname}) গুগল সাইন-ইনের জন্য অনুমোদিত তালিকায় নেই!

এটি সমাধান করতে অনুগ্রহ করে নিচের ধাপগুলো অনুসরণ করুন:
১. আপনার ফায়ারবেজ কনসোলে (https://console.firebase.google.com) যান।
২. "Authentication" মডিউল সিলেক্ট করে "Settings" ট্যাব এবং সেখান থেকে "Authorized domains" সেকশনে যান।
৩. "Add domain" বাটনে ক্লিক করে হুবহু এই ডোমেনটি যুক্ত করুন: ${window.location.hostname}
৪. সেভ (Save) করে এই পেজটি রিফ্রেশ দিন এবং পুনরায় গুগল সাইন-ইন চেষ্টা করুন।`);
      } else {
        setAuthError(`লগইন ব্যর্থ হয়েছে: ${errMsg}`);
      }
    }
  };

  // Demo Sandbox Bypass Login for testing/iframe compatibility
  const demoLogin = async () => {
    setLoadingAuth(true);
    setLoadingData(true);
    setIsSandboxMode(true);
    setAuthError(null);
    try {
      const demoUser: AppUser = {
        uid: "sandbox-tester-uid",
        email: "guest.test@fardousit.com",
        displayName: "ফরিদ হাসান (Guest Tester)",
        photoURL: "",
        isAdmin: true,
        isBlocked: false,
      };
      
      setCurrentUser(demoUser);
      setFirebaseUser({
        uid: demoUser.uid,
        email: demoUser.email,
        displayName: demoUser.displayName,
        photoURL: demoUser.photoURL,
        emailVerified: true
      } as any);

      // Populate high fidelity demo products
      const mockProds: Product[] = [
        {
          id: "prod-101",
          name: "সনি ব্র্যাভিয়া ৩২ ইঞ্চি স্মার্ট টিভি (Sony Bravia TV)",
          sku: "SNY-B32-SM",
          category: "ইলেকট্রনিক্স ও গ্যাজেটস",
          purchasePrice: 22000,
          sellingPrice: 28500,
          stock: 3, // Low stock limit <= 5! Perfect for testing alerts
          unit: "টি (Pcs)"
        },
        {
          id: "prod-102",
          name: "ওয়ালটন নো-ফ্রস্ট রিফ্রিজারেটর (Walton Fridge)",
          sku: "WLN-F34-NF",
          category: "হোম অ্যাপ্লায়েন্স",
          purchasePrice: 31000,
          sellingPrice: 36000,
          stock: 8,
          unit: "টি (Pcs)"
        },
        {
          id: "prod-103",
          name: "প্যারাসুট নারিকেল তেল ২০০মি:লি: (Parachute Oil)",
          sku: "PRT-CO200-ML",
          category: "কসমেটিক্স ও গ্যাজেটস",
          purchasePrice: 110,
          sellingPrice: 135,
          stock: 25,
          unit: "টি (Pcs)"
        },
        {
          id: "prod-104",
          name: "প্যান্টেন অ্যান্টি-হেয়ারফল শ্যাম্পু (Pantene Shampoo)",
          sku: "PNT-S180-ML",
          category: "কসমেটিক্স ও গ্যাজেটস",
          purchasePrice: 160,
          sellingPrice: 220,
          stock: 4, // Low stock limit <= 5! Perfect for testing alerts
          unit: "টি (Pcs)"
        }
      ];
      setProducts(mockProds);
      setSales([]);
      setStockMovements([]);
    } catch (e) {
      console.error("Demo login error: ", e);
    } finally {
      setLoadingAuth(false);
      setLoadingData(false);
    }
  };

  // Sign Out
  const logout = async () => {
    try {
      if (!isSandboxMode) {
        await signOut(auth);
      }
      setIsSandboxMode(false);
      setFirebaseUser(null);
      setCurrentUser(null);
      setProducts([]);
      setSales([]);
      setStockMovements([]);
      setUsers([]);
      setIssues([]);
      setAuthError(null);
    } catch (error) {
      console.error('Logout error: ', error);
    }
  };

  // Pre-load demo products for the merchant
  const initDemoProducts = async (userProfile: AppUser & { businessType?: string; isInitialized?: boolean }) => {
    try {
      const bType = userProfile.businessType || 'Others';
      const demoItems = getDemoProductsForBusiness(bType);
      
      const batchList = [];
      for (const item of demoItems) {
        const prodId = doc(collection(db, 'products')).id;
        const fullProduct: Product = {
          id: prodId,
          name: item.name,
          sku: `${item.sku}-${Math.floor(100 + Math.random() * 900)}`,
          category: item.category,
          purchasePrice: item.purchasePrice,
          sellingPrice: item.sellingPrice,
          stock: item.stock,
          unit: item.unit,
          createdByEmail: userProfile.email,
          updatedAt: new Date().toISOString()
        };
        
        batchList.push(setDoc(doc(db, 'products', prodId), fullProduct));
        
        // Stock movement initial write
        if (item.stock > 0) {
          const mvId = doc(collection(db, 'stockMovements')).id;
          const movement: StockMovement = {
            id: mvId,
            productId: prodId,
            productName: item.name,
            type: 'in',
            quantity: item.stock,
            date: new Date().toISOString(),
            note: 'প্রারম্ভিক ডেমো স্টক (Initial Demo Stock)',
            recordedByEmail: userProfile.email,
          };
          batchList.push(setDoc(doc(db, 'stockMovements', mvId), movement));
        }
      }
      
      await Promise.all(batchList);
      
      // Update our Firestore user record to mark initialized = true
      await updateDoc(doc(db, 'users', userProfile.uid), { isInitialized: true });
      userProfile.isInitialized = true;
    } catch (e) {
      console.error("Failed to initialize demo products:", e);
    }
  };

  // Shop signup / business register method
  const registerUser = async (regData: { 
    fullName: string; 
    phone: string; 
    email: string; 
    businessType: string; 
    businessName: string; 
    message: string; 
  }) => {
    try {
      const emailLower = regData.email.trim().toLowerCase();
      // 1. Temp mail validations
      if (isDisposableEmail(emailLower)) {
        return { 
          success: false, 
          message: "টেম্পোরারি বা ডিসপোজেবল ইমেইল ব্যবহার করা যাবে না। দয়া করে আপনার সঠিক গুগল জিমেইল অ্যাড্রেসটি ব্যবহার করুন।" 
        };
      }

      // 1b. Check system registration mode: public | whitelist | admin_only
      try {
        const sysSnap = await getDoc(doc(db, 'settings', 'system'));
        const sys = sysSnap.exists() ? sysSnap.data() : { registrationMode: 'public' };
        const mode = sys?.registrationMode || 'public';
        if (mode === 'admin_only') {
          return {
            success: false,
            message: 'পাবলিক রেজিস্ট্রেশন বর্তমানে বন্ধ। নতুন অ্যাকাউন্টের জন্য অ্যাডমিনের সাথে যোগাযোগ করুন।'
          };
        }
        if (mode === 'whitelist') {
          const allowed: string[] = (sys?.whitelistEmails || []).map((e: string) => (e || '').toLowerCase());
          if (!allowed.includes(emailLower)) {
            return {
              success: false,
              message: 'দুঃখিত! এই ইমেইলটি অনুমোদিত হোয়াইটলিস্টে নেই। অ্যাডমিনের সাথে যোগাযোগ করুন।'
            };
          }
        }
      } catch (e) {
        console.warn('settings/system read failed, defaulting to public:', e);
      }

      // 2. See if already registered
      const regRef = doc(db, 'registrations', emailLower);
      const regSnap = await getDoc(regRef);
      if (regSnap.exists()) {
        return {
          success: false,
          message: `দুঃখিত! এই ইমেইলটি (${emailLower}) ইতিমধ্যে রেজিস্টার্ড রয়েছে। দয়া করে সঠিক ইমেইল দিন বা লগইন করুন।`
        };
      }

      // 3. Write document to registrations collection.
      //    Client can NEVER set approved:true; always pending on create.
      const newReg = {
        fullName: regData.fullName,
        phone: regData.phone,
        email: emailLower,
        businessType: regData.businessType,
        businessName: regData.businessName,
        message: regData.message,
        approved: false,
        status: 'pending',
        approvedAt: null,
        approvedBy: null,
        createdAt: new Date().toISOString(),
      };

      await setDoc(regRef, newReg);
      return {
        success: true,
        message: `আপনার রেজিস্ট্রেশন গ্রহণ করা হয়েছে (${emailLower})। অ্যাডমিন approve করার পর আপনি গুগল সাইন-ইন করে অ্যাপে প্রবেশ করতে পারবেন।`
      };
    } catch (error: any) {
      console.error("Registration error:", error);
      return { 
        success: false, 
        message: `রেজিস্ট্রেশন ব্যর্থ হয়েছে: ${error.message || error}` 
      };
    }
  };

  // Listen to Auth State changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      // Reset the workspace-claim gate on every auth transition. Without
      // this, a previous user's 'ready' status could briefly leak listeners
      // for the next user before their claim resolves.
      setWorkspaceClaim(null);
      setClaimRefreshing(false);
      if (user) {
        const userEmail = (user.email || '').toLowerCase();

        // Admin identity via Firebase Custom Claims (request.auth.token.admin == true).
        // Fallback: legacy hardcoded emails preserved only for existing bootstrap.
        let isAdminUser = false;
        try {
          const tokenRes = await user.getIdTokenResult();
          isAdminUser = tokenRes?.claims?.admin === true;
        } catch (e) {
          console.warn('getIdTokenResult failed:', e);
        }
        if (!isAdminUser) {
          isAdminUser = userEmail === 'fardous.jp2021@gmail.com' || userEmail === 'info.fardousit@gmail.com';
        }

        // Gate 1: email must be verified (Google accounts return true automatically)
        if (!isAdminUser && user.emailVerified !== true) {
          setAuthError('Please verify your email. আপনার ইমেইল ভেরিফাই করুন।');
          await signOut(auth);
          setFirebaseUser(null);
          setCurrentUser(null);
          setLoadingAuth(false);
          return;
        }

        try {
          // Gate 2: registration must exist, be approved, and not rejected
          let registrationData: any = null;
          if (!isAdminUser) {
            const regRef = doc(db, 'registrations', userEmail);
            const regSnap = await getDoc(regRef);
            if (regSnap.exists()) registrationData = regSnap.data();
          }

          if (!isAdminUser) {
            if (!registrationData) {
              setAuthError(`দুঃখিত! আপনার ইমেইলটি (${user.email}) আমাদের সিস্টেমে নিবন্ধিত নয়। দয়া করে আগে রেজিস্ট্রেশন করুন!`);
              await signOut(auth);
              setFirebaseUser(null);
              setCurrentUser(null);
              setLoadingAuth(false);
              return;
            }
            if (registrationData.status === 'rejected') {
              setAuthError('Your registration has been rejected. আপনার রেজিস্ট্রেশন প্রত্যাখ্যান করা হয়েছে।');
              await signOut(auth);
              setFirebaseUser(null);
              setCurrentUser(null);
              setLoadingAuth(false);
              return;
            }
            if (registrationData.approved !== true) {
              setAuthError('Your account is waiting for admin approval. আপনার অ্যাকাউন্ট অ্যাডমিনের অনুমোদনের অপেক্ষায় আছে।');
              await signOut(auth);
              setFirebaseUser(null);
              setCurrentUser(null);
              setLoadingAuth(false);
              return;
            }
          }



          setAuthError(null);

          // Get/Create standard user profile
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            const newUser: AppUser & { businessType?: string; businessName?: string; isInitialized?: boolean } = {
              uid: user.uid,
              email: user.email || '',
              displayName: registrationData?.fullName || user.displayName || 'নামহীন ইউজার',
              photoURL: user.photoURL || '',
              isAdmin: isAdminUser,
              isBlocked: false,
              businessType: registrationData?.businessType || 'Others',
              businessName: registrationData?.businessName || 'আমার ফাস্ট ইনভেন্টরি',
              isInitialized: false,
            };
            
            await setDoc(userDocRef, newUser);
            setCurrentUser(newUser);
            await initDemoProducts(newUser);
          } else {
            const userData = userDoc.data() as AppUser & { businessType?: string; businessName?: string; isInitialized?: boolean };
            
            // Strict enforce admin tags
            if (isAdminUser && !userData.isAdmin) {
              await updateDoc(userDocRef, { isAdmin: true });
              userData.isAdmin = true;
            }
            
            // If they are registered but somehow isInitialized is false, initialize demo products
            if (userData.isInitialized === false) {
              await initDemoProducts(userData);
            }
            setCurrentUser(userData);
          }
        } catch (error) {
          console.error("Error fetching/creating user profile", error);
        }

        // Phase 3 pre-flight: resolve the workspaceId custom claim BEFORE
        // any protected listener effect can run. Force-refresh the token
        // once when the claim is missing (covers users approved after
        // this session's token was minted). Admins are allowed through.
        try {
          setClaimRefreshing(true);
          const status = await ensureWorkspaceClaim(user);
          setWorkspaceClaim(status);
          if (status.state === 'missing') {
            setAuthError(
              'Your workspace access is still being provisioned. Please sign out and sign back in. আপনার ওয়ার্কস্পেস তৈরি হচ্ছে, দয়া করে সাইন আউট করে আবার সাইন ইন করুন।',
            );
          } else if (status.state === 'error') {
            console.warn('ensureWorkspaceClaim failed:', status.error);
          }
        } finally {
          setClaimRefreshing(false);
        }
      } else {
        setCurrentUser(null);
        try { localStorage.removeItem('activeWorkspaceId'); } catch { /* noop */ }
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to real-time data when user is loaded and not blocked
  useEffect(() => {
    if (isSandboxMode) {
      setLoadingData(false);
      return;
    }
    if (!firebaseUser || !currentUser || currentUser.isBlocked) {
      setLoadingData(false);
      return;
    }
    // Phase 3 pre-flight gate: do NOT open business-collection listeners
    // until the workspaceId custom claim has been resolved (or the caller
    // is an admin). Without this gate Phase 2 rules reject boot-time
    // listeners with permission-denied for any session holding a
    // pre-approval token. See docs/multi-tenant-phase3-blocker-investigation.md.
    if (!workspaceClaim || !canOpenBusinessListeners(workspaceClaim)) {
      setLoadingData(false);
      return;
    }

    setLoadingData(true);

    const scoped = isPhase3FlagOn('phase3_query_scoping');
    const productsRef = scoped
      ? scopedQuery(db, 'products')
      : collection(db, 'products');
    const unsubProducts = isNoWorkspaceQuery(productsRef) ? () => {} : onSnapshot(
      productsRef,
      (snapshot) => {
        const prodList: Product[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          const pEmail = (d.createdByEmail || '').toLowerCase();
          
          if (currentUser.isAdmin || pEmail === currentUser.email.toLowerCase()) {
            // Safe Parsing & Migration Layer: Ensures older or mutated records always resolve perfectly
            prodList.push({
              id: docSnap.id,
              name: d.name || 'নামহীন পণ্য',
              sku: d.sku || '',
              category: d.category || 'অন্যান্য',
              purchasePrice: Number(d.purchasePrice) || 0,
              sellingPrice: Number(d.sellingPrice) || 0,
              stock: Number(d.stock) || 0,
              unit: d.unit || 'টি',
              createdByEmail: d.createdByEmail || '',
              updatedAt: d.updatedAt || '',
              ...d
            } as Product);
          }
        });
        setProducts(prodList);
        setLoadingData(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'products');
      }
    );

    // Rolling window: subscribe only to the last 90 days of sales to keep
    // Firestore reads (and client memory) bounded. Older records are fetched
    // on demand via `loadOlderSales(beforeISO)`.
    const SALES_WINDOW_DAYS = 90;
    const windowStartISO = new Date(Date.now() - SALES_WINDOW_DAYS * 86400_000).toISOString();
    const salesRef = scoped
      ? scopedQuery(
          db,
          'sales',
          where('date', '>=', windowStartISO),
          orderBy('date', 'desc'),
          limit(2000),
        )
      : query(
          collection(db, 'sales'),
          where('date', '>=', windowStartISO),
          orderBy('date', 'desc'),
          limit(2000),
        );
    const unsubSales = isNoWorkspaceQuery(salesRef) ? () => {} : onSnapshot(
      salesRef,
      (snapshot) => {
        const salesList: Sale[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          const rEmail = (d.recordedByEmail || '').toLowerCase();
          
          if (currentUser.isAdmin || rEmail === currentUser.email.toLowerCase()) {
            // Safe Parsing Layer for Sales
            salesList.push({
              id: docSnap.id,
              productId: d.productId || '',
              productName: d.productName || 'অজানা পণ্য',
              quantity: Number(d.quantity) || 0,
              unitPrice: Number(d.unitPrice) || 0,
              purchasePriceAtTime: Number(d.purchasePriceAtTime) || 0,
              totalPrice: Number(d.totalPrice) || 0,
              customerName: d.customerName || 'খুচরা গ্রাহক',
              date: d.date || new Date().toISOString(),
              recordedByEmail: d.recordedByEmail || '',
              ...d
            } as Sale);
          }
        });
        setSales(salesList);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'sales');
      }
    );

    const movementsRef = scoped
      ? scopedQuery(db, 'stockMovements')
      : collection(db, 'stockMovements');
    const unsubMovements = isNoWorkspaceQuery(movementsRef) ? () => {} : onSnapshot(
      movementsRef,
      (snapshot) => {
        const movementsList: StockMovement[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          const rEmail = (d.recordedByEmail || '').toLowerCase();
          
          if (currentUser.isAdmin || rEmail === currentUser.email.toLowerCase()) {
            // Safe Parsing Layer for Movements
            movementsList.push({
              id: docSnap.id,
              productId: d.productId || '',
              productName: d.productName || 'অজানা পণ্য',
              type: d.type || 'in',
              quantity: Number(d.quantity) || 0,
              date: d.date || new Date().toISOString(),
              note: d.note || '',
              recordedByEmail: d.recordedByEmail || '',
              ...d
            } as StockMovement);
          }
        });
        setStockMovements(movementsList);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'stockMovements');
      }
    );

    // Watch issues (Admins see all issues, normal users see only theirs)
    const issuesRef = scoped
      ? scopedQuery(db, 'issues')
      : collection(db, 'issues');
    const unsubIssues = isNoWorkspaceQuery(issuesRef) ? () => {} : onSnapshot(
      issuesRef,
      (snapshot) => {
        const issueList: SupportIssue[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          const issue = {
            id: docSnap.id,
            userId: d.userId || '',
            userEmail: d.userEmail || '',
            userName: d.userName || 'অজানা ইউজার',
            message: d.message || '',
            systemStateSummary: d.systemStateSummary || '',
            date: d.date || new Date().toISOString(),
            isResolved: !!d.isResolved,
            resolutionNote: d.resolutionNote || '',
            ...d
          } as SupportIssue;
          
          if (currentUser.isAdmin || issue.userId === currentUser.uid) {
            issueList.push(issue);
          }
        });
        issueList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setIssues(issueList);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'issues');
      }
    );

    let unsubUsers = () => {};
    // Admins need to list and monitor all users
    if (currentUser.isAdmin) {
      const usersRef = scoped ? scopedQuery(db, 'users') : collection(db, 'users');
      unsubUsers = isNoWorkspaceQuery(usersRef) ? () => {} : onSnapshot(
        usersRef,
        (snapshot) => {
          const uList: AppUser[] = [];
          snapshot.forEach((doc) => {
            uList.push(doc.data() as AppUser);
          });
          setUsers(uList);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'users');
        }
      );
    } else {
      // Non-admins can only see themselves
      setUsers([currentUser]);
    }

    return () => {
      unsubProducts();
      unsubSales();
      unsubMovements();
      unsubIssues();
      unsubUsers();
    };
  }, [firebaseUser, currentUser, workspaceClaim]);

  // Product CRUD
  const addProduct = async (product: Omit<Product, 'id'>) => {
    const id = doc(collection(db, 'products')).id;
    const fullProduct: Product = { 
      id, 
      ...product, 
      createdByEmail: currentUser?.email || '', 
      updatedAt: new Date().toISOString() 
    };

    if (isSandboxMode) {
      setProducts(prev => [fullProduct, ...prev]);
      if (product.stock > 0) {
        const mvId = doc(collection(db, 'stockMovements')).id;
        const movement: StockMovement = {
          id: mvId,
          productId: id,
          productName: product.name,
          type: 'in',
          quantity: product.stock,
          date: new Date().toISOString(),
          note: 'প্রারম্ভিক স্টক (Initial Stock)',
          recordedByEmail: currentUser?.email || '',
        };
        setStockMovements(prev => [movement, ...prev]);
      }
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const prodRef = doc(db, 'products', id);
        transaction.set(prodRef, fullProduct);

        if (product.stock > 0) {
          const mvId = doc(collection(db, 'stockMovements')).id;
          const movement: StockMovement = {
            id: mvId,
            productId: id,
            productName: product.name,
            type: 'in',
            quantity: product.stock,
            date: new Date().toISOString(),
            note: 'প্রারম্ভিক স্টক (Initial Stock)',
            recordedByEmail: currentUser?.email || '',
          };
          const mvRef = doc(db, 'stockMovements', mvId);
          transaction.set(mvRef, movement);
        }
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `products/${id}`);
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    if (isSandboxMode) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...productData } as Product : p));
      return;
    }
    try {
      await updateDoc(doc(db, 'products', id), productData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    }
  };

  const deleteProduct = async (id: string) => {
    if (isSandboxMode) {
      setProducts(prev => prev.filter(p => p.id !== id));
      return;
    }
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  // Sales
  const addSale = async (saleData: Omit<Sale, 'id'>) => {
    const id = doc(collection(db, 'sales')).id;
    const fullSale: Sale = { id, ...saleData, recordedByEmail: currentUser?.email || '' };
    
    if (isSandboxMode) {
      setSales(prev => [fullSale, ...prev]);
      
      // Update inventory stock to low stock limit alert check
      setProducts(prevProds => prevProds.map(p => {
        if (p.id === saleData.productId) {
          return { ...p, stock: Math.max(0, p.stock - saleData.quantity) };
        }
        return p;
      }));

      // Create Stock Movement
      const mvId = doc(collection(db, 'stockMovements')).id;
      const movement: StockMovement = {
        id: mvId,
        productId: saleData.productId,
        productName: saleData.productName,
        type: 'out',
        quantity: saleData.quantity,
        date: saleData.date,
        note: `বিক্রয় রসিদ: ${saleData.customerName || 'খুচরা ক্রেতা'}`,
        recordedByEmail: currentUser?.email || '',
      };
      setStockMovements(prev => [movement, ...prev]);
      return;
    }
    
    try {
      await runTransaction(db, async (transaction) => {
        const productRef = doc(db, 'products', saleData.productId);
        const productSnap = await transaction.get(productRef);
        if (productSnap.exists()) {
          const prod = productSnap.data() as Product;
          const newStock = Math.max(0, (prod.stock || 0) - saleData.quantity);
          transaction.update(productRef, { stock: newStock });
        }

        const saleRef = doc(db, 'sales', id);
        transaction.set(saleRef, fullSale);

        const mvId = doc(collection(db, 'stockMovements')).id;
        const movement: StockMovement = {
          id: mvId,
          productId: saleData.productId,
          productName: saleData.productName,
          type: 'out',
          quantity: saleData.quantity,
          date: saleData.date,
          note: `বিক্রয় রসিদ: ${saleData.customerName || 'খুচরা ক্রেতা'}`,
          recordedByEmail: currentUser?.email || '',
        };
        const mvRef = doc(db, 'stockMovements', mvId);
        transaction.set(mvRef, movement);
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `sales/${id}`);
    }
  };

  const deleteSale = async (id: string) => {
    if (isSandboxMode) {
      const saleToDelete = sales.find(s => s.id === id);
      if (saleToDelete) {
        // Rollback stock
        setProducts(prevProds => prevProds.map(p => {
          if (p.id === saleToDelete.productId) {
            return { ...p, stock: p.stock + saleToDelete.quantity };
          }
          return p;
        }));

        // Delete sale from state
        setSales(prev => prev.filter(s => s.id !== id));

        // Create Refund stock log
        const mvId = doc(collection(db, 'stockMovements')).id;
        const movement: StockMovement = {
          id: mvId,
          productId: saleToDelete.productId,
          productName: saleToDelete.productName,
          type: 'in',
          quantity: saleToDelete.quantity,
          date: new Date().toISOString(),
          note: `বিক্রয় বাতিলকরণ রিফান্ড (রসিদ #${id.substring(0, 5)})`,
        };
        setStockMovements(prev => [movement, ...prev]);
      }
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const saleRef = doc(db, 'sales', id);
        const saleSnap = await transaction.get(saleRef);
        if (saleSnap.exists()) {
          const saleData = saleSnap.data() as Sale;

          const productRef = doc(db, 'products', saleData.productId);
          const productSnap = await transaction.get(productRef);
          if (productSnap.exists()) {
            const prod = productSnap.data() as Product;
            transaction.update(productRef, { stock: (prod.stock || 0) + saleData.quantity });
          }

          const mvId = doc(collection(db, 'stockMovements')).id;
          const movement: StockMovement = {
            id: mvId,
            productId: saleData.productId,
            productName: saleData.productName,
            type: 'in',
            quantity: saleData.quantity,
            date: new Date().toISOString(),
            note: `বিক্রয় বাতিলকরণ রিফান্ড (রসিদ #${id.substring(0, 5)})`,
          };
          const mvRef = doc(db, 'stockMovements', mvId);
          transaction.set(mvRef, movement);

          transaction.delete(saleRef);
        }
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `sales/${id}`);
    }
  };

  // Stock Movement add
  const addStockMovement = async (movementData: Omit<StockMovement, 'id'>) => {
    const id = doc(collection(db, 'stockMovements')).id;
    const fullMovement: StockMovement = { id, ...movementData };

    if (isSandboxMode) {
      setStockMovements(prev => [fullMovement, ...prev]);
      
      // Update inventory stock
      setProducts(prevProds => prevProds.map(p => {
        if (p.id === movementData.productId) {
          let newStock = p.stock;
          if (movementData.type === 'in') {
            newStock += movementData.quantity;
          } else {
            newStock = Math.max(0, newStock - movementData.quantity);
          }
          return { ...p, stock: newStock };
        }
        return p;
      }));
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const productRef = doc(db, 'products', movementData.productId);
        const productSnap = await transaction.get(productRef);
        if (productSnap.exists()) {
          const prod = productSnap.data() as Product;
          let newStock = prod.stock || 0;
          if (movementData.type === 'in') {
            newStock += movementData.quantity;
          } else {
            newStock = Math.max(0, newStock - movementData.quantity);
          }
          transaction.update(productRef, { stock: newStock });
        }

        const mvRef = doc(db, 'stockMovements', id);
        transaction.set(mvRef, fullMovement);
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `stockMovements/${id}`);
    }
  };

  // User Administration
  const toggleUserBlock = async (uid: string, isBlocked: boolean) => {
    try {
      await updateDoc(doc(db, 'users', uid), { isBlocked });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const toggleUserAdmin = async (uid: string, isAdmin: boolean) => {
    try {
      await updateDoc(doc(db, 'users', uid), { isAdmin });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  // Import Backup logic
  const importBackup = async (data: { products: Product[]; sales: Sale[]; stockMovements: StockMovement[] }) => {
    try {
      const batch = writeBatch(db);
      
      // Populate Products
      for (const prod of data.products) {
        const pRef = doc(db, 'products', prod.id);
        batch.set(pRef, prod);
      }
      
      // Populate Sales
      for (const sale of data.sales) {
        const sRef = doc(db, 'sales', sale.id);
        batch.set(sRef, sale);
      }
      
      // Populate Movements
      for (const mv of data.stockMovements) {
        const mvRef = doc(db, 'stockMovements', mv.id);
        batch.set(mvRef, mv);
      }
      
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'batch_import');
    }
  };

  // Support Ticket actions
  const addSupportIssue = async (message: string, systemStateSummary?: string) => {
    if (!currentUser) return;
    const issueId = doc(collection(db, 'issues')).id;
    const newIssue: SupportIssue = {
      id: issueId,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      userName: currentUser.displayName,
      message,
      systemStateSummary: systemStateSummary || `Browser: ${navigator.userAgent} | Size: ${window.innerWidth}x${window.innerHeight}`,
      date: new Date().toISOString(),
      isResolved: false,
      resolutionNote: '',
    };
    try {
      await setDoc(doc(db, 'issues', issueId), newIssue);
    } catch (error) {
      console.error("Error creating support report ticket", error);
    }
  };

  const resolveSupportIssue = async (id: string, resolutionNote?: string) => {
    try {
      await updateDoc(doc(db, 'issues', id), {
        isResolved: true,
        resolutionNote: resolutionNote || 'সমস্যাটির সফল সমাধান করা হয়েছে।',
      });
    } catch (error) {
      console.error("Error resolving support ticket", error);
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      firebaseUser,
      products,
      sales,
      stockMovements,
      users,
      issues,
      loadingAuth,
      loadingData,
      login,
      demoLogin,
      isSandboxMode,
      logout,
      theme,
      toggleTheme,
      addProduct,
      updateProduct,
      deleteProduct,
      addSale,
      deleteSale,
      addStockMovement,
      toggleUserBlock,
      toggleUserAdmin,
      importBackup,
      addSupportIssue,
      resolveSupportIssue,
      authError,
      clearAuthError,
      registerUser
    }}>
      {claimRefreshing && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
            padding: '8px 16px', textAlign: 'center', fontSize: 13,
            background: '#fef3c7', color: '#78350f',
            borderBottom: '1px solid #fcd34d',
          }}
        >
          Refreshing your workspace access… আপনার ওয়ার্কস্পেস অ্যাক্সেস রিফ্রেশ হচ্ছে…
        </div>
      )}
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};