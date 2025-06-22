-- Add mock users from various countries for leaderboards
INSERT INTO users (id, username, nationality, year, score, games_played, created_at, updated_at) VALUES
-- Top performers
('mock_user_1', 'GeoMaster_DE', 'Germany', 1995, 15420, 23, NOW() - INTERVAL '5 days', NOW()),
('mock_user_2', 'WorldExplorer_US', 'United States', 1988, 14850, 19, NOW() - INTERVAL '3 days', NOW()),
('mock_user_3', 'MapWizard_JP', 'Japan', 1992, 13990, 18, NOW() - INTERVAL '2 days', NOW()),
('mock_user_4', 'GlobeHunter_FR', 'France', 1990, 13200, 16, NOW() - INTERVAL '4 days', NOW()),
('mock_user_5', 'AtlasKing_GB', 'United Kingdom', 1987, 12800, 15, NOW() - INTERVAL '6 days', NOW()),

-- Mid-tier players
('mock_user_6', 'TravelBug_CA', 'Canada', 1993, 9850, 14, NOW() - INTERVAL '1 day', NOW()),
('mock_user_7', 'Navigator_AU', 'Australia', 1991, 9200, 13, NOW() - INTERVAL '3 days', NOW()),
('mock_user_8', 'Compass_IT', 'Italy', 1989, 8750, 12, NOW() - INTERVAL '2 days', NOW()),
('mock_user_9', 'Wanderer_ES', 'Spain', 1994, 8300, 11, NOW() - INTERVAL '4 days', NOW()),
('mock_user_10', 'Scout_BR', 'Brazil', 1986, 7900, 10, NOW() - INTERVAL '5 days', NOW()),

-- More German players for country leaderboard
('mock_user_11', 'BerlinBear_DE', 'Germany', 1996, 11200, 14, NOW() - INTERVAL '2 days', NOW()),
('mock_user_12', 'MunichMike_DE', 'Germany', 1985, 10800, 13, NOW() - INTERVAL '3 days', NOW()),
('mock_user_13', 'HamburgHero_DE', 'Germany', 1991, 9600, 12, NOW() - INTERVAL '1 day', NOW()),

-- More US players
('mock_user_14', 'NYCNinja_US', 'United States', 1993, 10500, 13, NOW() - INTERVAL '2 days', NOW()),
('mock_user_15', 'LALegend_US', 'United States', 1989, 9800, 12, NOW() - INTERVAL '4 days', NOW()),
('mock_user_16', 'ChicagoChamp_US', 'United States', 1992, 8900, 11, NOW() - INTERVAL '3 days', NOW()),

-- More Japanese players
('mock_user_17', 'TokyoTiger_JP', 'Japan', 1990, 10200, 12, NOW() - INTERVAL '1 day', NOW()),
('mock_user_18', 'OsakaOwl_JP', 'Japan', 1994, 9400, 11, NOW() - INTERVAL '2 days', NOW()),

-- More French players
('mock_user_19', 'ParisianPro_FR', 'France', 1988, 9700, 12, NOW() - INTERVAL '3 days', NOW()),
('mock_user_20', 'LyonLion_FR', 'France', 1991, 8800, 10, NOW() - INTERVAL '2 days', NOW()),

-- Russian players
('mock_user_21', 'MoscowMaster_RU', 'Russia', 1987, 12100, 15, NOW() - INTERVAL '4 days', NOW()),
('mock_user_22', 'SiberianSage_RU', 'Russia', 1993, 10900, 13, NOW() - INTERVAL '2 days', NOW()),
('mock_user_23', 'PetersburgPro_RU', 'Russia', 1990, 9300, 11, NOW() - INTERVAL '3 days', NOW()),

-- Chinese players
('mock_user_24', 'BeijingBoss_CN', 'China', 1992, 11800, 14, NOW() - INTERVAL '1 day', NOW()),
('mock_user_25', 'ShanghaiStar_CN', 'China', 1989, 10600, 12, NOW() - INTERVAL '3 days', NOW()),

-- Indian players
('mock_user_26', 'MumbaiMaestro_IN', 'India', 1991, 10300, 12, NOW() - INTERVAL '2 days', NOW()),
('mock_user_27', 'DelhiDynamo_IN', 'India', 1994, 9100, 11, NOW() - INTERVAL '4 days', NOW()),

-- More diverse countries
('mock_user_28', 'StockholmStar_SE', 'Sweden', 1990, 9500, 11, NOW() - INTERVAL '2 days', NOW()),
('mock_user_29', 'OsloOracle_NO', 'Norway', 1988, 8700, 10, NOW() - INTERVAL '3 days', NOW()),
('mock_user_30', 'AmsterdamAce_NL', 'Netherlands', 1993, 8200, 9, NOW() - INTERVAL '1 day', NOW()),
('mock_user_31', 'ZurichZen_CH', 'Switzerland', 1987, 7800, 8, NOW() - INTERVAL '4 days', NOW()),
('mock_user_32', 'ViennaVirtuoso_AT', 'Austria', 1992, 7400, 7, NOW() - INTERVAL '2 days', NOW()),
('mock_user_33', 'WarsawWarrior_PL', 'Poland', 1989, 7000, 6, NOW() - INTERVAL '3 days', NOW()),
('mock_user_34', 'PragueProdigy_CZ', 'Czech Republic', 1991, 6600, 5, NOW() - INTERVAL '1 day', NOW()),
('mock_user_35', 'BudapestBeast_HU', 'Hungary', 1994, 6200, 4, NOW() - INTERVAL '2 days', NOW())

ON CONFLICT (id) DO NOTHING;
