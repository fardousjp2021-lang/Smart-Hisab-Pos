# SmartHisab POS Project Guidelines & Agent Rules

## Git & Deployment Workflow Rule (Always Active)
- **Proactive GitHub Push Suggestion**:
  After every code edit, bug fix, feature addition, or UI modification, the agent **MUST ALWAYS** proactively suggest to the user to push the updates to GitHub:
  - Provide a short 1-line prompt offering to push immediately:
    > "💡 **টিপ:** এই পরিবর্তনগুলো কি GitHub-এ পুশ করে দেব? শুধু 'হ্যাঁ' অথবা 'পুশ করো' বললেই আমি সাথে সাথে লাইভ সার্ভারে পাঠিয়ে দেব।"
  - When the user confirms, automatically run:
    1. `git add .`
    2. `git commit -m "<descriptive message>"`
    3. `git push -u origin main`
