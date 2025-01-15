INSERT INTO users (
    _id, name, email, phone, gender, nid, dob, image, userRole, verified, accountStatus, license_number, expire_date, experience, address_id
) VALUES
-- User 1
('USER-1734755975780', 'Rakib Hasan', 'rakib.hasan@gmail.com', '01712345678', 'Male', '1234567890123456', '1990-05-10', 'images/rakib.jpg', 'user', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354680'),
-- User 2
('USER-1734755976303', 'Shamima Akter', 'shamima.akter@yahoo.com', '01823456789', 'Female', '2234567890123456', '1988-07-15', 'images/shamima.jpg', 'user', FALSE, 'Inactive', NULL, NULL, NULL, 'Add-1734757354320'),
-- User 3
('USER-1734755975956', 'Jahidul Islam', 'jahidul.islam@outlook.com', '01634567890', 'Male', '3234567890123456', '1995-03-12', 'images/jahidul.jpg', 'user', TRUE, 'Active', 'DL123456789', '2025-06-30', 5, 'Add-1734757354298'),
-- User 4
('USER-1734755975710', 'Nusrat Jahan', 'nusrat.jahan@gmail.com', '01945678901', 'Female', '4234567890123456', '1992-11-22', 'images/nusrat.jpg', 'user', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354678'),
-- User 5
('USER-1734755975481', 'Ashraful Alam', 'ashraful.alam@yahoo.com', '01856789012', 'Male', '5234567890122456', '1985-04-19', 'images/ashraful.jpg', 'user', FALSE, 'Suspended', 'DL987654321', '2024-12-01', 8, 'Add-1734757354419'),
-- User 6
('USER-1734755975601', 'Taslima Begum', 'taslima.begum@gmail.com', '01567890123', 'Female', '6234567890123456', '1998-08-05', 'images/taslima.jpg', 'user', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354246'),
-- User 7
('USER-1734755976316', 'Mehedi Hasan', 'mehedi.hasan@gmail.com', '01778901234', 'Male', '7234567890123456', '1983-02-28', 'images/mehedi.jpg', 'user', TRUE, 'Active', 'DL112233445', '2026-09-15', 10, 'Add-1734757354762'),
-- User 8
('USER-1734755975889', 'Sadia Rahman', 'sadia.rahman@yahoo.com', '01689012345', 'Female', '8234567890123456', '1997-01-16', 'images/sadia.jpg', 'user', FALSE, 'Inactive', NULL, NULL, NULL, 'Add-1734757354078'),
-- User 9
('USER-1734755975383', 'Rafiq Ahmed', 'rafiq.ahmed@outlook.com', '01890123456', 'Male', '9234567890123456', '1980-10-09', 'images/rafiq.jpg', 'user', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354604'),
-- User 10
('USER-1734755976078', 'Jannat Ara', 'jannat.ara@gmail.com', '01701234567', 'Female', '0234567890123456', '1993-06-25', 'images/jannat.jpg', 'user', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354332'),
('USER-1734755975741', 'Aminul Islam', 'aminul.islam@gmail.com', '01711223344', 'Male', '1234567890123412', '1990-09-12', 'images/aminul.jpg', 'user', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354552'),
-- User 2
('USER-1734755975524', 'Shahana Akter', 'shahana.akter@yahoo.com', '01899887766', 'Female', '2234567890123413', '1988-03-21', 'images/shahana.jpg', 'user', FALSE, 'Inactive', NULL, NULL, NULL, 'Add-1734757354815'),
-- User 3
('USER-1734755975927', 'Habib Rahman', 'habib.rahman@gmail.com', '01622334455', 'Male', '3234567890123414', '1985-06-15', 'images/habib.jpg', 'user', TRUE, 'Suspended', 'DL667788990', '2024-11-30', 6, 'Add-1734757354464'),
-- User 4
('USER-1734755975963', 'Farzana Yasmin', 'farzana.yasmin@outlook.com', '01933445566', 'Female', '4234567890123415', '1992-05-17', 'images/farzana.jpg', 'user', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354135'),
-- User 5
('USER-1734755975720', 'Shahidul Alam', 'shahidul.alam@yahoo.com', '01844556677', 'Male', '5234567890123416', '1991-12-02', 'images/shahidul.jpg', 'user', TRUE, 'Active', 'DL778899001', '2025-04-25', 9, 'Add-1734757354124'),
-- User 6
('USER-1734755976169', 'Rina Parvin', 'rina.parvin@gmail.com', '01555662788', 'Female', '6234567890123417', '1999-01-11', 'images/rina.jpg', 'user', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354213'),
-- User 7
('USER-1734755975981', 'Mahfuz Alam', 'mahfuz.alam@gmail.com', '01766778899', 'Male', '7234567890123418', '1984-08-14', 'images/mahfuz.jpg', 'user', TRUE, 'Active', 'DL889900112', '2026-02-18', 12, 'Add-1734757354513'),
-- User 8
('USER-1734755975747', 'Nazia Sultana', 'nazia.sultana@yahoo.com', '01877889900', 'Female', '8234567890123419', '1993-04-09', 'images/nazia.jpg', 'user', FALSE, 'Inactive', NULL, NULL, NULL, 'Add-1734757354640'),
-- User 9
('USER-1734755976094', 'Ashik Mahmud', 'ashik.mahmud@outlook.com', '01688990011', 'Male', '9234567890123420', '1987-07-19', 'images/ashik.jpg', 'user', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354802'),
-- User 10
('USER-1734755976247', 'Sadia Khatun', 'sadia.khatun@gmail.com', '01999001122', 'Female', '0234567890123421', '1996-03-30', 'images/sadia.jpg', 'user', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757355019'),
('USER-1734755975497', 'Kamrul Hasan', 'kamrul.hasan@gmail.com', '01712365489', 'Male', '1234567890123422', '1989-12-18', 'images/kamrul.jpg', 'user', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354563'),
-- User 2
('USER-1734755976353', 'Maliha Noor', 'maliha.noor@yahoo.com', '01898675432', 'Female', '2234567890123423', '1997-09-09', 'images/maliha.jpg', 'user', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354523'),
-- User 3
('USER-1734755975869', 'Faisal Rahman', 'faisal.rahman@outlook.com', '01623456789', 'Male', '3234567890123424', '1986-05-25', 'images/faisal.jpg', 'user', TRUE, 'Suspended', 'DL112334556', '2024-11-20', 7, 'Add-1734757354755'),
-- User 4
('USER-1734755975487', 'Sumaiya Akter', 'sumaiya.akter@gmail.com', '01567893456', 'Female', '4234567890123425', '1994-01-10', 'images/sumaiya.jpg', 'user', FALSE, 'Inactive', NULL, NULL, NULL, 'Add-1734757354844'),
-- User 5
('USER-1734755975938', 'Ahsan Kabir', 'ahsan.kabir@gmail.com', '01755566677', 'Male', '5234567890123426', '1983-07-15', 'images/ahsan.jpg', 'user', TRUE, 'Active', 'DL778890011', '2026-08-15', 15, 'Add-1734757354711'),
-- User 6
('USER-1734755976217', 'Razia Sultana', 'razia.sultana@gmail.com', '01898765431', 'Female', '6234567890123427', '1990-03-29', 'images/razia.jpg', 'user', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757355018'),
-- User 7
('USER-1734755976110', 'Imran Hossain', 'imran.hossain@yahoo.com', '01699887755', 'Male', '7234567890123428', '1995-06-14', 'images/imran.jpg', 'user', TRUE, 'Active', 'DL123456700', '2025-10-30', 6, 'Add-1734757354121'),
-- User 8
('USER-1734755975808', 'Nasima Khatun', 'nasima.khatun@outlook.com', '01555443322', 'Female', '8234567890123429', '1988-11-03', 'images/nasima.jpg', 'user', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354312'),
-- User 9
('USER-1734755975946', 'Shakil Ahmed', 'shakil.ahmed@gmail.com', '01777788899', 'Male', '9234567890123430', '1992-02-11', 'images/shakil.jpg', 'user', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354095'),
-- User 10
('USER-1734755975622', 'Faria Yasmin', 'faria.yasmin@gmail.com', '01988990012', 'Female', '0234567890123431', '1998-04-08', 'images/faria.jpg', 'user', FALSE, 'Inactive', NULL, NULL, NULL, 'Add-1734757354799'),
('USER-1734783250617', 'Kamrunnahar Akter', 'kamrunnahar.akter@gmail.com', '01719876543', 'Female', '1234567890123432', '1990-05-16', 'images/kamrunnahar.jpg', 'agency', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354523'),
-- User 2
('USER-1734783250643', 'Rakib Hossain', 'rakib.hossain@yahoo.com', '01633445566', 'Male', '2234567890123433', '1985-08-22', 'images/rakib.jpg', 'agency', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354633'),
-- User 3
('USER-1734783251356', 'Shamima Sultana', 'shamima.sultana@gmail.com', '01505667788', 'Female', '3234567890123434', '1988-12-05', 'images/shamima.jpg', 'agency', FALSE, 'Inactive', NULL, NULL, NULL, 'Add-1734757354186'),
-- User 4
('USER-1734783250779', 'Tarek Rahman', 'tarek.rahman@gmail.com', '01812398765', 'Male', '4234567890123435', '1989-04-30', 'images/tarek.jpg', 'agency', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354508'),
-- User 5
('USER-1734783251259', 'Sumon Ahmed', 'sumon.ahmed@outlook.com', '01766678899', 'Male', '5234567890123436', '1993-11-10', 'images/sumon.jpg', 'agency', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354521'),
-- User 6
('USER-1734783251120', 'Nazia Rahman', 'nazia.rahman@yahoo.com', '01999887766', 'Female', '6234567890123437', '1995-01-20', 'images/nazia.jpg', 'agency', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354755'),
-- User 7
('USER-1734783250826', 'Rafiq Islam', 'rafiq.islam@gmail.com', '01611223354', 'Male', '7234567890123438', '1987-06-14', 'images/rafiq.jpg', 'agency', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354582'),
-- User 8
('USER-1734783251093', 'Mahmuda Khatun', 'mahmuda.khatun@gmail.com', '01755443322', 'Female', '8234567890123439', '1992-09-05', 'images/mahmuda.jpg', 'agency', FALSE, 'Suspended', NULL, NULL, NULL, 'Add-1734757354255'),
-- User 9
('USER-1734783259617', 'Shahinur Alam', 'shahinur.alam@gmail.com', '01988776655', 'Male', '9234567890123440', '1990-03-14', 'images/shahinur.jpg', 'agency', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354558'),
-- User 10
('USER-1734783250521', 'Rokeya Begum', 'rokeya.begum@gmail.com', '01899887744', 'Female', '0234567890123441', '1986-02-18', 'images/rokeya.jpg', 'agency', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354826'),
('USER-1734783250950', 'Farzana Parvin', 'farzana.parvin@gmail.com', '01856789123', 'Female', '1234567890123442', '1991-03-25', 'images/farzana.jpg', 'agency', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354101'),
-- User 2
('USER-1734783250767', 'Ruhul Amin', 'ruhul.amin@yahoo.com', '01733445566', 'Male', '2234567890123443', '1987-08-12', 'images/ruhul.jpg', 'agency', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354578'),
-- User 3
('USER-1734783251208', 'Sabina Yasmin', 'sabina.yasmin@gmail.com', '01911223344', 'Female', '3234567890123444', '1989-12-18', 'images/sabina.jpg', 'agency', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354399'),
-- User 4
('USER-1734783251287', 'Shahidul Islam', 'shahidul.islam@gmail.com', '01612398765', 'Male', '4234567890123445', '1985-04-04', 'images/shahidul.jpg', 'agency', TRUE, 'Inactive', NULL, NULL, NULL, 'Add-1734757354424'),
-- User 5
('USER-1734783251183', 'Jannatul Ferdous', 'jannatul.ferdous@outlook.com', '01599887766', 'Female', '5234567890123446', '1993-11-22', 'images/jannatul.jpg', 'agency', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354559'),
-- User 6
('USER-1734783251306', 'Masud Rana', 'masud.rana@gmail.com', '01788776655', 'Male', '6234567890123447', '1990-02-08', 'images/masud.jpg', 'agency', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354042'),
-- User 7
('USER-1734783250568', 'Nazmul Hossain', 'nazmul.hossain@yahoo.com', '01611223344', 'Male', '7234567890123448', '1986-05-19', 'images/nazmul.jpg', 'agency', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354641'),
-- User 8
('USER-1734783251333', 'Razia Begum', 'razia.begum@gmail.com', '01833445522', 'Female', '8234567890123449', '1994-06-30', 'images/razia.jpg', 'agency', TRUE, 'Suspended', NULL, NULL, NULL, 'Add-1734757354201'),
-- User 9
('USER-1734783251371', 'Habibullah Khan', 'habibullah.khan@gmail.com', '01511223355', 'Male', '9234567890123450', '1988-01-14', 'images/habibullah.jpg', 'agency', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354356'),
-- User 10
('USER-1734783250673', 'Anjuman Ara', 'anjuman.ara@gmail.com', '01744556677', 'Female', '0234567890123451', '1992-10-23', 'images/anjuman.jpg', 'agency', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734757354877'),
('USER-1734783251340', 'Sultana Akter', 'sultana.akter@gmail.com', '01799887744', 'Female', '1234567890123452', '1991-09-15', 'images/sultana.jpg', 'agency', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734782537954'),
-- User 2
('USER-1734783250864', 'Kamal Hossain', 'kamal.hossain@yahoo.com', '01655443322', 'Male', '2234567890123453', '1988-06-21', 'images/kamal.jpg', 'agency', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734782538229'),
-- User 3
('USER-1734783250982', 'Nusrat Jahan', 'nusrat.jahan9@gmail.com', '0189988766', 'Female', '3234567890123454', '1990-03-12', 'images/nusrat.jpg', 'agency', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734782538410'),
-- User 4
('USER-1734783250517', 'Tanvir Rahman', 'tanvir.rahman@outlook.com', '01533445566', 'Male', '4234567890123455', '1987-12-08', 'images/tanvir.jpg', 'agency', TRUE, 'Inactive', NULL, NULL, NULL, 'Add-1734782537666'),
-- User 5
('USER-1734783250621', 'Mahfuza Sultana', 'mahfuza.sultana@gmail.com', '01911223345', 'Female', '5234567890123456', '1995-07-03', 'images/mahfuza.jpg', 'agency', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734782538099'),
-- User 6
('USER-1734783251155', 'Rokibul Hasan', 'rokibul.hasan@gmail.com', '01840556677', 'Male', '6234567890123457', '1993-04-27', 'images/rokibul.jpg', 'agency', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734782537611'),
-- User 7
('USER-1734783251177', 'Mokhlesur Rahman', 'mokhlesur.rahman@yahoo.com', '01711223388', 'Male', '7234567890123458', '1985-11-19', 'images/mokhlesur.jpg', 'agency', FALSE, 'Suspended', NULL, NULL, NULL, 'Add-1734782538330'),
-- User 8
('USER-1734783250608', 'Fahmida Khatun', 'fahmida.khatun@gmail.com', '01699887711', 'Female', '8234567890123459', '1994-08-05', 'images/fahmida.jpg', 'agency', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734782537654'),
-- User 9
('USER-1734783251299', 'Raihan Islam', 'raihan.islam@gmail.com', '01555167788', 'Male', '9234567890123460', '1986-02-14', 'images/raihan.jpg', 'agency', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734782537546'),
-- User 10
('USER-1734783250901', 'Sharmin Akter', 'sharmin.akter@gmail.com', '01888776699', 'Female', '0234567890123461', '1992-10-11', 'images/sharmin.jpg', 'agency', TRUE, 'Active', NULL, NULL, NULL, 'Add-1734782538291');








INSERT INTO agencies (
    agency_id, agency_Name, agency_Email, owner_id, phone_Number, image, total_vehicles, businessRegNumber, TIN, insuranceNumber, registration_date, licenseExpireDate, status, verified, address_id
) VALUES
-- Agency 1
('AG-1734771688291', 'Green Line Rentals', 'info@greenline.com.bd', 'USER-1734783250617', '01799887744', 'images/greenline.jpg', 12, 'BRN-12345678', 'TIN-87654321', 'INS-45678901', '2021-06-15', '2026-06-15', 'active', TRUE, 'Add-1734757354523'),
-- Agency 2
('AG-1734771688557', 'City Drive Services', 'contact@citydrive.com.bd', 'USER-1734783250643', '01655443322', 'images/citydrive.jpg', 8, 'BRN-23456789', 'TIN-98765432', 'INS-56789012', '2020-09-01', '2025-09-01', 'active', TRUE, 'Add-1734757354633'),
-- Agency 3
('AG-1734771688682', 'Prime Auto Rental', 'support@primeauto.com.bd', 'USER-1734783251356', '01899887766', 'images/primeauto.jpg', 10, 'BRN-34567890', 'TIN-87654320', 'INS-67890123', '2022-03-20', '2027-03-20', 'inactive', TRUE, 'Add-1734757354186'),
-- Agency 4
('AG-1734771688849', 'Speedy Rentals', 'info@speedyrentals.com.bd', 'USER-1734783250779', '01533445566', 'images/speedyrentals.jpg', 5, 'BRN-45678901', 'TIN-76543210', 'INS-78901234', '2019-11-10', '2024-11-10', 'suspended', FALSE, 'Add-1734757354508'),
-- Agency 5
('AG-1734771688632', 'Comfort Cars', 'hello@comfortcars.com.bd', 'USER-1734783251259', '01911223334', 'images/comfortcars.jpg', 15, 'BRN-56789012', 'TIN-65432109', 'INS-89012345', '2023-01-05', '2028-01-05', 'active', TRUE, 'Add-1734757354521'),
-- Agency 6
('AG-1734771688396', 'Smart Wheel Rentals', 'info@smartwheel.com.bd', 'USER-1734783251120', '01844656677', 'images/smartwheel.jpg', 7, 'BRN-67890123', 'TIN-54321098', 'INS-90123456', '2020-07-15', '2025-07-15', 'inactive', TRUE, 'Add-1734757354755'),
-- Agency 7
('AG-1734771688120', 'Elite Drive Services', 'contact@elitedrive.com.bd', 'USER-1734783250826', '01711223388', 'images/elitedrive.jpg', 9, 'BRN-78901234', 'TIN-43210987', 'INS-01234567', '2018-05-20', '2023-05-20', 'active', TRUE, 'Add-1734757354582'),
-- Agency 8
('AG-1734771688161', 'Ace Car Rentals', 'info@acecarrentals.com.bd', 'USER-1734783251093', '01699887711', 'images/acecar.jpg', 6, 'BRN-89012345', 'TIN-32109876', 'INS-12345678', '2021-10-12', '2026-10-12', 'active', TRUE, 'Add-1734757354255'),
-- Agency 9
('AG-1734771687913', 'Royal Auto Rentals', 'support@royalauto.com.bd', 'USER-1734783250617', '01555667788', 'images/royalauto.jpg', 11, 'BRN-90123456', 'TIN-21098765', 'INS-23456789', '2022-02-08', '2027-02-08', 'inactive', TRUE, 'Add-1734757354558'),
-- Agency 10
('AG-1734771688740', 'Express Car Hire', 'hello@expresscarhire.com.bd', 'USER-1734783250521', '01888776699', 'images/expresscar.jpg', 13, 'BRN-01234567', 'TIN-10987654', 'INS-34567890', '2019-12-25', '2024-12-25', 'suspended', FALSE, 'Add-1734757354826'),
('AG-1734771688269', 'Bangla Car Rentals', 'info@banglacars.com.bd', 'USER-1734783250950', '01712345670', 'images/banglacars.jpg', 10, 'BRN-12457896', 'TIN-98765432', 'INS-12345678', '2020-03-10', '2025-03-10', 'active', TRUE, 'Add-1734757354101'),
-- Agency 2
('AG-1734771688544', 'Dhaka Drive Ltd.', 'contact@dhakadrive.com.bd', 'USER-1734783250767', '01665432109', 'images/dhakadrive.jpg', 8, 'BRN-23456781', 'TIN-87654321', 'INS-23456789', '2021-07-20', '2026-07-20', 'inactive', TRUE, 'Add-1734757354578'),
-- Agency 3
('AG-1734771688222', 'Metro Rentals BD', 'support@metrorentals.com.bd', 'USER-1734783251208', '01876543211', 'images/metrorentals.jpg', 12, 'BRN-34567892', 'TIN-76543210', 'INS-34567890', '2019-12-15', '2024-12-15', 'active', TRUE, 'Add-1734757354399'),
-- Agency 4
('AG-1734771687957', 'Rapid Wheels', 'info@rapidwheels.com.bd', 'USER-1734783251287', '01987654321', 'images/rapidwheels.jpg', 5, 'BRN-45678903', 'TIN-65432109', 'INS-45678901', '2022-05-18', '2027-05-18', 'suspended', FALSE, 'Add-1734757354424'),
-- Agency 5
('AG-1734771688755', 'Elite Auto Hire', 'elite@autohire.com.bd', 'USER-1734783251183', '01512398765', 'images/eliteauto.jpg', 15, 'BRN-56789014', 'TIN-54321098', 'INS-56789012', '2020-08-12', '2025-08-12', 'active', TRUE, 'Add-1734757354559'),
-- Agency 6
('AG-1734771688190', 'Urban Car Service', 'info@urbancar.com.bd', 'USER-1734783251306', '01799887766', 'images/urbancar.jpg', 7, 'BRN-67890125', 'TIN-43210987', 'INS-67890123', '2021-09-05', '2026-09-05', 'inactive', FALSE, 'Add-1734757354042'),
-- Agency 7
('AG-1734771688628', 'Prime Auto Hire', 'prime@autohire.com.bd', 'USER-1734783250568', '01644556677', 'images/primeauto.jpg', 9, 'BRN-78901236', 'TIN-32109876', 'INS-78901234', '2018-04-22', '2023-04-22', 'active', TRUE, 'Add-1734757354641'),
-- Agency 8
('AG-1734771688680', 'DriveX BD', 'info@drivexbd.com.bd', 'USER-1734783251333', '01855443222', 'images/drivex.jpg', 11, 'BRN-89012347', 'TIN-21098765', 'INS-89012345', '2019-11-11', '2024-11-11', 'suspended', FALSE, 'Add-1734757354201'),
-- Agency 9
('AG-1734771688065', 'Quick Wheels', 'quick@wheels.com.bd', 'USER-1734783251371', '01566778899', 'images/quickwheels.jpg', 6, 'BRN-90123458', 'TIN-10987654', 'INS-90123456', '2020-06-25', '2025-06-25', 'active', TRUE, 'Add-1734757354356'),
-- Agency 10
('AG-1734771688251', 'Zoom Car Rentals', 'zoom@carrentals.com.bd', 'USER-1734783250673', '01944556688', 'images/zoomcars.jpg', 13, 'BRN-01234569', 'TIN-09876543', 'INS-01234567', '2021-02-14', '2026-02-14', 'inactive', TRUE, 'Add-1734757354877'),
('AG-1734771688195', 'Safe Ride BD', 'contact@saferidebd.com.bd', 'USER-1734783251340', '01722334455', 'images/saferide.jpg', 10, 'BRN-11223344', 'TIN-99887766', 'INS-77665544', '2019-04-10', '2024-04-10', 'active', TRUE, 'Add-1734782537954'),
-- Agency 2
('AG-1734771688313', 'Trust Car Rentals', 'info@trustcarrentals.com.bd', 'USER-1734783250864', '01699887766', 'images/trustcar.jpg', 8, 'BRN-22334455', 'TIN-88776655', 'INS-66554433', '2020-08-15', '2025-08-15', 'inactive', FALSE, 'Add-1734782538229'),
-- Agency 3
('AG-1734771688757', 'Golden Wheels', 'support@goldenwheels.com.bd', 'USER-1734783250982', '01944556677', 'images/goldenwheels.jpg', 12, 'BRN-33445566', 'TIN-77665544', 'INS-55443322', '2018-12-25', '2023-12-25', 'active', TRUE, 'Add-1734782538410'),
-- Agency 4
('AG-1734771688009', 'Royal Auto Hire', 'info@royalauto.com.bd', 'USER-1734783250517', '01855443322', 'images/royalauto.jpg', 7, 'BRN-44556677', 'TIN-66554433', 'INS-44332211', '2021-03-05', '2026-03-05', 'suspended', FALSE, 'Add-1734782537666'),
-- Agency 5
('AG-1734771688688', 'NextGen Rentals', 'nextgen@rentals.com.bd', 'USER-1734783250621', '01788776655', 'images/nextgen.jpg', 15, 'BRN-55667788', 'TIN-55443322', 'INS-33221100', '2020-01-12', '2025-01-12', 'active', TRUE, 'Add-1734782538099'),
-- Agency 6
('AG-1734771688830', 'Swift Drive BD', 'info@swiftdrive.com.bd', 'USER-1734783251155', '01622334455', 'images/swiftdrive.jpg', 9, 'BRN-66778899', 'TIN-44332211', 'INS-22110099', '2019-06-18', '2024-06-18', 'inactive', FALSE, 'Add-1734782537611'),
-- Agency 7
('AG-1734771688539', 'Premium Auto Service', 'premium@autoservice.com.bd', 'USER-1734783251177', '01833445566', 'images/premiumauto.jpg', 11, 'BRN-77889900', 'TIN-33221100', 'INS-11009988', '2021-11-10', '2026-11-10', 'suspended', TRUE, 'Add-1734782538330'),
-- Agency 8
('AG-1734771688232', 'Orbit Rentals', 'info@orbitrentals.com.bd', 'USER-1734783250608', '01955667788', 'images/orbitrentals.jpg', 6, 'BRN-88990011', 'TIN-22110099', 'INS-00998877', '2020-05-30', '2025-05-30', 'active', FALSE, 'Add-1734782537654'),
-- Agency 9
('AG-1734771688506', 'Fast Wheels', 'fast@wheels.com.bd', 'USER-1734783251299', '01733445566', 'images/fastwheels.jpg', 13, 'BRN-99001122', 'TIN-11009988', 'INS-99887766', '2019-09-22', '2024-09-22', 'active', TRUE, 'Add-1734782537546'),
-- Agency 10
('AG-1734771688243', 'Reliable Auto Hire', 'info@reliableauto.com.bd', 'USER-1734783250901', '01666778899', 'images/reliableauto.jpg', 14, 'BRN-00112233', 'TIN-00998877', 'INS-88776655', '2021-02-18', '2026-02-18', 'inactive', TRUE, 'Add-1734782538291');







INSERT INTO address_info (address_id, user_id, agency_id, district, upazilla, keyArea, area) VALUES
-- Address 1
('Add-1734757354680', 'USER-1734755975780', NULL, 'Dhaka', 'Dhaka North', 'Uttara', 'House 45, Sector 6, Uttara, Dhaka North'),
-- Address 2
('Add-1734757354320', 'USER-1734755976303', NULL, 'Dhaka', 'Dhaka North', 'Mirpur', 'Road 11, Block C, Mirpur-2, Dhaka North'),
-- Address 3
('Add-1734757354298', 'USER-1734755975956', NULL, 'Dhaka', 'Dhaka North', 'Gulshan', 'Flat 2A, Road 18, Gulshan-1, Dhaka North'),
-- Address 4
('Add-1734757354678', 'USER-1734755975710', NULL, 'Dhaka', 'Dhaka North', 'Banani', 'Apartment 402, Road 8, Banani, Dhaka North'),
-- Address 5
('Add-1734757354419', 'USER-1734755975481', NULL, 'Dhaka', 'Dhaka North', 'Baridhara', 'House 17, Park Road, Baridhara, Dhaka North'),
-- Address 6
('Add-1734757354246', 'USER-1734755975601', NULL, 'Dhaka', 'Dhaka North', 'Mohakhali', 'Flat 7C, Mohakhali DOHS, Dhaka North'),
-- Address 7
('Add-1734757354762', 'USER-1734755976316', NULL, 'Dhaka', 'Dhaka North', 'Bashundhara', 'Apartment 501, Block G, Bashundhara R/A, Dhaka North'),
-- Address 8
('Add-1734757354078', 'USER-1734755975889', NULL, 'Dhaka', 'Dhaka North', 'Badda', 'Building 10, Lake View Road, Badda, Dhaka North'),
-- Address 9
('Add-1734757354604', 'USER-1734755975383', NULL, 'Dhaka', 'Dhaka North', 'Khilkhet', 'Plot 25, Nikunja-2, Khilkhet, Dhaka North'),
-- Address 10
('Add-1734757354332', 'USER-1734755976078', NULL, 'Dhaka', 'Dhaka North', 'Tejgaon', 'Commercial Plot 9, Tejgaon Industrial Area, Dhaka North'),
('Add-1734757354552', 'USER-1734755975741', NULL, 'Dhaka', 'Dhaka South', 'Dhanmondi', 'House 12, Road 2, Dhanmondi, Dhaka South'),
-- Address 2
('Add-1734757354815', 'USER-1734755975524', NULL, 'Dhaka', 'Dhaka South', 'Jatrabari', 'Building 23, Kajla Road, Jatrabari, Dhaka South'),
-- Address 3
('Add-1734757354464', 'USER-1734755975927', NULL, 'Dhaka', 'Dhaka South', 'Motijheel', 'Plot 8, Motijheel C/A, Dhaka South'),
-- Address 4
('Add-1734757354135', 'USER-1734755975963', NULL, 'Dhaka', 'Dhaka South', 'Lalbagh', 'Flat 3A, Lalbagh Road, Dhaka South'),
-- Address 5
('Add-1734757354124', 'USER-1734755975720', NULL, 'Dhaka', 'Dhaka South', 'Azimpur', 'House 5, Azimpur Colony, Dhaka South'),
-- Address 6
('Add-1734757354213', 'USER-1734755976169', NULL, 'Dhaka', 'Dhaka South', 'Paltan', 'Flat 4B, VIP Road, Paltan, Dhaka South'),
-- Address 7
('Add-1734757354513', 'USER-1734755975981', NULL, 'Dhaka', 'Dhaka South', 'Khilgaon', 'Building 15, Block B, Khilgaon, Dhaka South'),
-- Address 8
('Add-1734757354640', 'USER-1734755975747', NULL, 'Dhaka', 'Dhaka South', 'Wari', 'House 9, Rankin Street, Wari, Dhaka South'),
-- Address 9
('Add-1734757354802', 'USER-1734755976094', NULL, 'Dhaka', 'Dhaka South', 'Gendaria', 'Plot 4, Railway Colony, Gendaria, Dhaka South'),
-- Address 10
('Add-1734757355019', 'USER-1734755976247', NULL, 'Dhaka', 'Dhaka South', 'New Market', 'Shop 23, New Market, Dhaka South'),
('Add-1734757354563', 'USER-1734755975497', NULL, 'Dhaka', 'Dhaka North', 'Kafrul', 'Building 12, Kafrul, Dhaka North'),
-- Address 2 (Dhaka North)
('Add-1734757354523', 'USER-1734755976353', NULL, 'Dhaka', 'Dhaka North', 'Kalachandpur', 'House 8, Kalachandpur, Dhaka North'),
-- Address 3 (Dhaka South)
('Add-1734757354755', 'USER-1734755975869', NULL, 'Dhaka', 'Dhaka South', 'Shahbagh', 'Flat 5A, Shahbagh Road, Dhaka South'),
-- Address 4 (Dhaka South)
('Add-1734757354844', 'USER-1734755975487', NULL, 'Dhaka', 'Dhaka South', 'Sutrapur', 'House 15, Sutrapur Lane, Dhaka South'),
-- Address 5 (Dhaka South)
('Add-1734757354711', 'USER-1734755975938', NULL, 'Dhaka', 'Dhaka South', 'Hazaribagh', 'Plot 9, Hazaribagh Road, Dhaka South'),
-- Address 6 (Dhaka South)
('Add-1734757355018', 'USER-1734755976217', NULL, 'Dhaka', 'Dhaka South', 'Azimpur', 'House 14, Azimpur Road, Dhaka South'),
-- Address 7 (Dhaka South)
('Add-1734757354121', 'USER-1734755976110', NULL, 'Dhaka', 'Dhaka South', 'Paltan', 'Flat 3C, VIP Road, Paltan, Dhaka South'),
-- Address 8 (Dhaka North)
('Add-1734757354312', 'USER-1734755975808', NULL, 'Dhaka', 'Dhaka North', 'Pallabi', 'Building 18, Pallabi, Dhaka North'),
-- Address 9 (Dhaka North)
('Add-1734757354095', 'USER-1734755975946', NULL, 'Dhaka', 'Dhaka North', 'Tejgaon', 'Plot 21, Tejgaon Industrial Area, Dhaka North'),
-- Address 10 (Dhaka North)
('Add-1734757354799', 'USER-1734755975622', NULL, 'Dhaka', 'Dhaka North', 'Mohakhali', 'House 7, Mohakhali DOHS, Dhaka North'),
('Add-1734757354533', NULL, 'AG-1734771688291', 'Dhaka', 'Dhaka North', 'Uttara', 'Sector 3, Uttara, Dhaka North'),
-- Address 2
('Add-1734757354633', NULL, 'AG-1734771688557', 'Dhaka', 'Dhaka North', 'Mirpur', 'Block C, Mirpur 10, Dhaka North'),
-- Address 3
('Add-1734757354186', NULL, 'AG-1734771688682', 'Dhaka', 'Dhaka North', 'Gulshan', 'Road 45, Gulshan 2, Dhaka North'),
-- Address 4
('Add-1734757354508', NULL, 'AG-1734771688849', 'Dhaka', 'Dhaka North', 'Banani', 'Banani DOHS, Dhaka North'),
-- Address 5
('Add-1734757354521', NULL, 'AG-1734771688632', 'Dhaka', 'Dhaka North', 'Baridhara', 'Plot 7, Baridhara Diplomatic Zone, Dhaka North'),
-- Address 6
('Add-1734757354855', NULL, 'AG-1734771688396', 'Dhaka', 'Dhaka North', 'Mohakhali', 'House 12, Mohakhali DOHS, Dhaka North'),
-- Address 7
('Add-1734757354582', NULL, 'AG-1734771688120', 'Dhaka', 'Dhaka North', 'Bashundhara', 'Block H, Bashundhara R/A, Dhaka North'),
-- Address 8
('Add-1734757354255', NULL, 'AG-1734771688161', 'Dhaka', 'Dhaka North', 'Badda', 'Satarkul Road, Badda, Dhaka North'),
-- Address 9
('Add-1734757354558', NULL, 'AG-1734771687913', 'Dhaka', 'Dhaka North', 'Khilkhet', 'House 8, Khilkhet, Dhaka North'),
-- Address 10
('Add-1734757354826', NULL, 'AG-1734771688740', 'Dhaka', 'Dhaka North', 'Pallabi', 'Plot 18, Pallabi, Dhaka North'),
(Add-1734757354101, NULL, 'AG-1734771688269', 'Dhaka', 'Dhaka South', 'Dhanmondi', 'Road 8, Dhanmondi, Dhaka South'),
-- Address 2
(Add-1734757354578, NULL, 'AG-1734771688544', 'Dhaka', 'Dhaka South', 'Jatrabari', 'Kajla, Jatrabari, Dhaka South'),
-- Address 3
(Add-1734757354399, NULL, 'AG-1734771688222', 'Dhaka', 'Dhaka South', 'Motijheel', 'Dilkusha Commercial Area, Motijheel, Dhaka South'),
-- Address 4
(Add-1734757354424, NULL, 'AG-1734771687957', 'Dhaka', 'Dhaka South', 'Lalbagh', 'Chawk Bazar, Lalbagh, Dhaka South'),
-- Address 5
(Add-1734757354559, NULL, 'AG-1734771688755', 'Dhaka', 'Dhaka South', 'Azimpur', 'Azimpur Colony, Dhaka South'),
-- Address 6
(Add-1734757354042, NULL, 'AG-1734771688190', 'Dhaka', 'Dhaka South', 'Paltan', 'Purana Paltan Line, Dhaka South'),
-- Address 7
(Add-1734757354641, NULL, 'AG-1734771688628', 'Dhaka', 'Dhaka South', 'Khilgaon', 'Tilpapara, Khilgaon, Dhaka South'),
-- Address 8
(Add-1734757354201, NULL, 'AG-1734771688680', 'Dhaka', 'Dhaka South', 'Wari', 'Hrishikesh Das Road, Wari, Dhaka South'),
-- Address 9
(Add-1734757354356, NULL, 'AG-1734771688065', 'Dhaka', 'Dhaka South', 'Shahbagh', 'Bangladesh National Museum, Shahbagh, Dhaka South'),
-- Address 10
(Add-1734757354877, NULL, 'AG-1734771688251', 'Dhaka', 'Dhaka South', 'Hazaribagh', 'Rayerbazar, Hazaribagh, Dhaka South'),
(Add-1734782537954, NULL, 'AG-1734771688195', 'Dhaka', 'Dhaka South', 'Sutrapur', 'Sutrapur Bazar Road, Dhaka South'),
-- Address 2
(Add-1734782538229, NULL, 'AG-1734771688313', 'Dhaka', 'Dhaka South', 'Gendaria', 'Dhakeshwari Road, Gendaria, Dhaka South'),
-- Address 3
(Add-1734782538410, NULL, 'AG-1734771688757', 'Dhaka', 'Dhaka South', 'Wari', 'Tipu Sultan Road, Wari, Dhaka South'),
-- Address 4
(Add-1734782537666, NULL, 'AG-1734771688009', 'Dhaka', 'Dhaka South', 'Shahbagh', 'Ramna Park, Shahbagh, Dhaka South'),
-- Address 5
(Add-1734782538099, NULL, 'AG-1734771688688', 'Dhaka', 'Dhaka South', 'Azimpur', 'Azimpur Graveyard Road, Dhaka South'),
-- Address 6
(Add-1734782537611, NULL, 'AG-1734771688830', 'Dhaka', 'Dhaka South', 'Lalbagh', 'Lalbagh Fort Road, Dhaka South'),
-- Address 7
(Add-1734782538330, NULL, 'AG-1734771688539', 'Dhaka', 'Dhaka South', 'New Market', 'Nilkhet, New Market, Dhaka South'),
-- Address 8
(Add-1734782537654, NULL, 'AG-1734771688232', 'Dhaka', 'Dhaka South', 'Motijheel', 'Arambagh, Motijheel, Dhaka South'),
-- Address 9
(Add-1734782537546, NULL, 'AG-1734771688506', 'Dhaka', 'Dhaka South', 'Paltan', 'Kakrail Road, Paltan, Dhaka South'),
-- Address 10
(Add-1734782538291, NULL, 'AG-1734771688243', 'Dhaka', 'Dhaka South', 'Khilgaon', 'Goran, Khilgaon, Dhaka South');

