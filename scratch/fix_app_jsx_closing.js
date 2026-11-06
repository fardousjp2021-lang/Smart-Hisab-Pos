import fs from 'fs';

let app = fs.readFileSync('src/pos-app/App.tsx', 'utf8');

// Replace the end of the file
const oldEnd = `    </div>
    </div>
  );
}`;

const newEnd = `    </div>
    )}
    </div>
  );
}`;

if (app.includes(oldEnd)) {
  app = app.replace(oldEnd, newEnd);
  fs.writeFileSync('src/pos-app/App.tsx', app, 'utf8');
  console.log('Successfully fixed App.tsx JSX closing tags!');
} else {
  console.log('Old end pattern not found in App.tsx');
}
