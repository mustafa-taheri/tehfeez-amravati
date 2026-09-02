Admin Finance & Setup Features Walkthrough
I have implemented all the requested missing features on the Mobile application to complete the Admin side functionality for Marhala configs, Fee Collections, Settlements, and Huffaz Payables.

What's Completed
1. Marhala Fee Configurations
List Screen: Added MarhalaFeeConfigListScreen (completed previously) to view active configurations.
Form Screen: Added MarhalaFeeConfigFormScreen which allows the Admin to create or edit configurations, selecting the Academic Period and Marhala, and setting the monthly fee amount with active dates.
Backend Fix: Added a /academic-months/periods endpoint to easily fetch academic periods for the dropdowns.
2. Fee Collection Management
List Screen: Added FeeCollectionListScreen which displays fee records filtered by Academic Month, showing student details, outstanding amount, and payment status (PAID/UNPAID/PARTIAL).
Create Form: Added FeeCollectionFormScreen which allows the Admin to select a student, month, and active fee configuration to generate a new fee collection. Disocunts and waived amounts can be applied manually.
Details & Payments: Added FeeCollectionDetailScreen to view the full breakdown of a fee and record manual payments via Cash, UPI, etc.
3. Monthly Settlements
Settlement List: Added SettlementListScreen to see an overview of settlements (Generated/Locked status), total pool, and total students.
Generation: Added GenerateSettlementScreen as a quick form to pick an Academic Month and trigger the backend settlement generation.
Settlement Details: Added SettlementDetailScreen to review the details for every Huffaz in that month. The Admin can add manual adjustments (Bonus/Deduction) to individual Huffaz details. The Admin can also Lock the settlement from this screen once finalised.
4. Huffaz Payables
Payables Overview: Added HuffazPayableListScreen allowing the Admin to filter by Academic Month and see the final calculated payables, attendance days, and stats for all Huffaz at a glance.
5. Navigation & Wiring
Registered all 9 new screens in AppNavigator.tsx.
Updated the AdminDashboardScreen.tsx with new Quick Action buttons:
⚙️ Fee Configs
🧾 Fee Collections
🏦 Settlements
💰 Huffaz Payables
Verification Steps
Please open your mobile app (or reload it via Expo r), log in as an Admin, and verify the new quick action buttons on the dashboard. You should now be able to navigate through the entire finance workflow end-to-end. Let me know if any adjustments are needed to the UI or business logic!