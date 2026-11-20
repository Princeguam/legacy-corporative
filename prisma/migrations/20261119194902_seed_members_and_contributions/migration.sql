-- Seed: members, cooperative bank account, and capital contributions
-- Temp password for every member: Password@123 (bcrypt, 10 rounds) - make members change it on first login.
-- Amounts are whole naira, exactly as in the register. If your app stores kobo, multiply the amounts by 100.

BEGIN;

-- 1. Members
INSERT INTO "Users"
  ("firstName", "middleName", "lastName", "fullName", "email", "phoneNo", "dob", "occupation",
   "nextOfKinName", "nextOfKinRelationship", "nextOfKinPhone",
   "emergencyContact", "emergencyContactPhone", "emergencyContactRelationship",
   "address", "gender", "password", "updated")
SELECT v.*, CURRENT_TIMESTAMP
FROM (VALUES
  ('Ruth', NULL, 'Nkor', 'Ruth Nkor', 'ruthnkor03@gmail.com', '08029263607', DATE '2003-05-05', 'NYSC Corper', 'Verity Nkor', 'Sister', '07040938781', 'Bridget Nkor', '08036678782', 'Mother', 'No 12 Chief Joe Edem street off Essien Asibong Spring road calabar', 'Female', '$2b$10$OZSL7Q4WWErTfHJrPSxQSOhTRMNj/qq9nMA/iXT1kyMfBciNuOXHm'),
  ('Eno-abasi', NULL, 'Akpan', 'Eno-abasi Akpan', 'enoabasiakpan96@gmail.com', '09018207129', DATE '2003-06-21', 'NYSC Corper', 'Stella Timipua Kpodo', 'Mother', '07031608990', 'Stella Timipua Kpodo', '07031608990', 'Mother', '6 Balogun Town, Sangotedo, Eti-osa, Lagos state', 'Female', '$2b$10$OZSL7Q4WWErTfHJrPSxQSOhTRMNj/qq9nMA/iXT1kyMfBciNuOXHm'),
  ('Bello', 'Mordecai', 'Fiyinfoluwa', 'Bello Mordecai Fiyinfoluwa', 'bellofiyinfoluwa@gmail.com', '09056300476', DATE '2002-07-31', 'Public Servant', 'Bello Omowumi Dorcas', 'Mother', '08055170643', 'Damilola Adeyeye', '09055008257', 'Sister', 'Emerald flower estate Lokogoma Abuja', 'Male', '$2b$10$OZSL7Q4WWErTfHJrPSxQSOhTRMNj/qq9nMA/iXT1kyMfBciNuOXHm'),
  ('Uzomba', 'Tochukwu', 'Paul', 'Uzomba Tochukwu Paul', 'uzombatochukwu@yahoo.com', '08133590310', DATE '2000-09-25', 'Engineer', 'Uzomba Chukwudi Benjamin', 'Father', '08059687610', 'Uzomba Ugochukwu', '07062195819', 'Brother', 'Mubende Street Wuse Zone 3 Abuja.', 'Male', '$2b$10$OZSL7Q4WWErTfHJrPSxQSOhTRMNj/qq9nMA/iXT1kyMfBciNuOXHm'),
  ('Joy', 'Nnanna', 'Omini', 'Joy Nnanna Omini', 'joyomini2000@gmail.com', '07010591558', DATE '2000-09-25', 'Corp member', 'Omini Okoi Nnanna', 'Brother', '09072075606', 'Patience omini', '08161566765', 'Mother', 'Ikeja cantonment barracks Lagos', 'Female', '$2b$10$OZSL7Q4WWErTfHJrPSxQSOhTRMNj/qq9nMA/iXT1kyMfBciNuOXHm'),
  ('Chisom', 'Ndive', 'Prosper', 'Chisom Ndive Prosper', 'ndivechisom27@gmail.com', '07063791312', DATE '2004-04-27', 'Media strategist', 'Chidera Ndive', 'Sister', '08102484244', 'Chidera Ndive', '08102484244', 'Sister', 'No 18 Abraham Akinola street, Mangoro Ikeja', 'Male', '$2b$10$OZSL7Q4WWErTfHJrPSxQSOhTRMNj/qq9nMA/iXT1kyMfBciNuOXHm'),
  ('Verity', 'Mashel', 'Nkor', 'Verity Mashel Nkor', 'mashelnkor@gmail.com', '07040938781', DATE '2001-08-24', 'HR Professional', 'Ruth Nkor', 'Sister', '08029263607', 'Bridget Nkor', '08036678782', 'Mother', '21 Odunlade Street, Shomolu, Lagos', 'Female', '$2b$10$OZSL7Q4WWErTfHJrPSxQSOhTRMNj/qq9nMA/iXT1kyMfBciNuOXHm'),
  ('Edet', 'George', 'Bassey', 'Edet George Bassey', 'georgeedet2002@gmail.com', '09029512594', DATE '2002-05-05', 'Corp member', 'Edet OFFIONG Bassey', 'Sister', '09032326448', 'Edet OFFIONG Bassey', '09032326448', 'Sister', '19, Iwamimo street Ejigbo', 'Male', '$2b$10$OZSL7Q4WWErTfHJrPSxQSOhTRMNj/qq9nMA/iXT1kyMfBciNuOXHm'),
  ('Fredrick', 'Chukwunonyelum', 'Prosper', 'Fredrick Chukwunonyelum Prosper', 'fredprosper090@gmail.com', '09126784836', DATE '2003-06-15', 'Operations officer', 'Fredrick Okechukwu Wisdom', 'Brother', '08124836789', 'Mrs. Anthonia Chibuogwu', '08022783653', 'Mother', 'The Anglican Church of the Pentecost, Mabushi, Abuja.', 'Male', '$2b$10$OZSL7Q4WWErTfHJrPSxQSOhTRMNj/qq9nMA/iXT1kyMfBciNuOXHm'),
  ('Ohimai', 'Jonathan', 'Endurance', 'Ohimai Jonathan Endurance', 'ohimaijonathan1@gmail.com', '09038263261', DATE '2001-04-25', 'Finance Professional', 'Happiness Ohimai', 'Sister', '08120091635', 'Ohimai Happiness', '08120091635', 'Sister', 'No 7 Oloruntoyin street Bariga Lagos state', 'Male', '$2b$10$OZSL7Q4WWErTfHJrPSxQSOhTRMNj/qq9nMA/iXT1kyMfBciNuOXHm'),
  ('Wisdom', NULL, 'Fredrick', 'Wisdom Fredrick', 'wisdomfredrick144@gmail.com', '08124836789', DATE '2000-12-19', 'Accountant', 'Prosper Fredrick', 'Brother', '09166784806', 'Stephen Fredrick', '08165845733', 'Brother', 'Church of Pentecost', 'Male', '$2b$10$OZSL7Q4WWErTfHJrPSxQSOhTRMNj/qq9nMA/iXT1kyMfBciNuOXHm'),
  ('John', 'Grace', 'Mfonobong', 'John Grace Mfonobong', 'symplygraciela@gmail.com', '09066779568', DATE '2002-05-02', 'Entrepreneur', 'John Victory Ibok', 'Sister', '09070753182', 'John Victory Ibok', '09070753182', 'Sister', 'Ta Lagbaja cantonment', 'Female', '$2b$10$OZSL7Q4WWErTfHJrPSxQSOhTRMNj/qq9nMA/iXT1kyMfBciNuOXHm')
) AS v("firstName", "middleName", "lastName", "fullName", "email", "phoneNo", "dob", "occupation",
       "nextOfKinName", "nextOfKinRelationship", "nextOfKinPhone",
       "emergencyContact", "emergencyContactPhone", "emergencyContactRelationship",
       "address", "gender", "password");

-- 2. Cooperative bank account
INSERT INTO "BankAcconts" ("bankName", "accountName", "accountNumber")
VALUES ('United Bank For Africa (UBA)', 'Legacy Wealth Cooperative Society', '2460685344');

-- 3. Capital contributions
WITH member_map(member_id, email) AS (VALUES
    ('MBR-001', 'ruthnkor03@gmail.com'),
    ('MBR-002', 'enoabasiakpan96@gmail.com'),
    ('MBR-003', 'bellofiyinfoluwa@gmail.com'),
    ('MBR-004', 'uzombatochukwu@yahoo.com'),
    ('MBR-005', 'joyomini2000@gmail.com'),
    ('MBR-006', 'ndivechisom27@gmail.com'),
    ('MBR-007', 'mashelnkor@gmail.com'),
    ('MBR-008', 'georgeedet2002@gmail.com'),
    ('MBR-009', 'fredprosper090@gmail.com'),
    ('MBR-010', 'ohimaijonathan1@gmail.com'),
    ('MBR-011', 'wisdomfredrick144@gmail.com'),
    ('MBR-012', 'symplygraciela@gmail.com')
),
contributions(member_id, amount, paid_on, receipt) AS (VALUES
    ('MBR-001', 15000, '2026-09-01', 'RCT-0001'),
    ('MBR-002', 20000, '2026-09-02', 'RCT-0002'),
    ('MBR-003', 15000, '2026-09-02', 'RCT-0003'),
    ('MBR-004', 15000, '2026-09-02', 'RCT-0004'),
    ('MBR-005', 15000, '2026-09-09', 'RCT-0005'),
    ('MBR-006', 30000, '2026-09-19', 'RCT-0006'),
    ('MBR-001', 15000, '2026-09-19', 'RCT-0007'),
    ('MBR-004', 15000, '2026-09-24', 'RCT-0008'),
    ('MBR-005', 15000, '2026-10-01', NULL),
    ('MBR-002', 20000, '2026-10-01', NULL),
    ('MBR-009', 30000, '2026-10-01', NULL),
    ('MBR-007', 30000, '2026-10-02', NULL),
    ('MBR-003', 15000, '2026-10-02', NULL),
    ('MBR-001', 15000, '2026-10-05', NULL),
    ('MBR-012', 20000, '2026-10-08', NULL),
    ('MBR-004', 20000, '2026-10-25', NULL),
    ('MBR-005', 15000, '2026-10-31', NULL),
    ('MBR-002', 20000, '2026-10-31', NULL),
    ('MBR-007', 15000, '2026-11-02', NULL),
    ('MBR-012', 20000, '2026-11-05', NULL),
    ('MBR-003', 15000, '2026-11-05', NULL),
    ('MBR-009', 15000, '2026-11-06', NULL)
)
INSERT INTO "PaymentTransactions"
  ("bankAccountId", "userId", "status", "type", "amount", "currency", "note", "source",
   "period", "depositedAt", "reviewedAt", "updated")
SELECT b.id, u.id, 'CONFIRMED'::"TransactionStatus", 'DEPOSIT'::"TransactionType", c.amount::bigint, 'NGN', c.receipt, 'Admin'::"TransactionSource",
       date_trunc('month', c.paid_on::date), c.paid_on::date, c.paid_on::date, CURRENT_TIMESTAMP
FROM contributions c
JOIN member_map mm ON mm.member_id = c.member_id
JOIN "Users" u ON u.email = mm.email
JOIN "BankAcconts" b ON b."accountNumber" = '2460685344'
ORDER BY c.paid_on::date, c.member_id;

-- 4. Safety check: abort (and roll back everything) if the counts or total don't match the CSVs
DO $$
DECLARE n_users int; n_tx int; total numeric;
BEGIN
  SELECT count(*) INTO n_users FROM "Users" WHERE email IN (SELECT email FROM (VALUES
    ('bellofiyinfoluwa@gmail.com'),
    ('enoabasiakpan96@gmail.com'),
    ('fredprosper090@gmail.com'),
    ('georgeedet2002@gmail.com'),
    ('joyomini2000@gmail.com'),
    ('mashelnkor@gmail.com'),
    ('ndivechisom27@gmail.com'),
    ('ohimaijonathan1@gmail.com'),
    ('ruthnkor03@gmail.com'),
    ('symplygraciela@gmail.com'),
    ('uzombatochukwu@yahoo.com'),
    ('wisdomfredrick144@gmail.com')
  ) AS t(email));
  SELECT count(*), COALESCE(sum(amount),0) INTO n_tx, total
    FROM "PaymentTransactions" WHERE "bankAccountId" = (SELECT id FROM "BankAcconts" WHERE "accountNumber" = '2460685344');
  IF n_users <> 12 OR n_tx <> 22 OR total <> 405000 THEN
    RAISE EXCEPTION 'Seed check failed: users=%, transactions=%, total=%', n_users, n_tx, total;
  END IF;
END $$;

COMMIT;