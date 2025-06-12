-- MVP Task Templates - Adding the remaining 17 templates to complete the original MVP plan
-- Original MVP called for 20 essential templates across 6 categories
-- We currently have 3, adding 17 more to reach the MVP goal

-- HVAC Category (2 more needed - we have "Change air filter")
INSERT INTO task_templates (
  title, category, description, difficulty_level, estimated_duration_minutes,
  frequency_months, seasonal_months, applies_to_home_types, applies_to_equipment_types,
  materials_needed, tools_needed, why_important, consequences_if_skipped,
  instructions, active, created_at, updated_at
) VALUES 
-- HVAC Templates
(
  'Clean HVAC Vents and Registers',
  'hvac',
  'Clean air vents and return registers to improve airflow and indoor air quality.',
  2, 45, 6, ARRAY[3,4,9,10],
  ARRAY['single_family', 'townhouse', 'condo', 'apartment'],
  ARRAY['hvac', 'central_air', 'heat_pump'],
  ARRAY['microfiber cloths', 'vacuum cleaner', 'mild soap'],
  ARRAY['screwdriver', 'vacuum with brush attachment'],
  'Clean vents improve airflow efficiency and reduce dust circulation throughout your home.',
  'Blocked vents reduce system efficiency by up to 25% and can cause uneven heating/cooling.',
  '{"steps": ["Remove vent covers with screwdriver", "Vacuum inside ducts as far as reachable", "Wash vent covers with soap and water", "Dry completely before reinstalling", "Replace covers securely"]}',
  true, NOW(), NOW()
),
(
  'Service HVAC System',
  'hvac',
  'Professional HVAC system maintenance including inspection, cleaning, and tune-up.',
  4, 120, 12, ARRAY[3,4,9,10],
  ARRAY['single_family', 'townhouse', 'condo'],
  ARRAY['hvac', 'central_air', 'heat_pump', 'furnace'],
  ARRAY['professional service'],
  NULL,
  'Annual service maintains efficiency, prevents breakdowns, and extends system life.',
  'Unserviced HVAC systems lose 5% efficiency per year and are prone to expensive failures.',
  '{"steps": ["Schedule professional service", "Ensure access to equipment", "Review maintenance checklist with technician", "Keep service records", "Schedule next service"]}',
  true, NOW(), NOW()
),

-- Plumbing Category (3 templates needed)
(
  'Check for Water Leaks',
  'plumbing',
  'Inspect faucets, toilets, pipes, and water connections for leaks throughout the home.',
  2, 30, 3, ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
  ARRAY['single_family', 'townhouse', 'condo', 'apartment'],
  ARRAY['plumbing', 'water_heater', 'dishwasher', 'washing_machine'],
  ARRAY['flashlight', 'paper towels'],
  ARRAY['adjustable wrench', 'pipe wrench'],
  'Early leak detection prevents water damage and reduces utility bills.',
  'Undetected leaks can cause thousands in damage and waste hundreds of gallons monthly.',
  '{"steps": ["Check under sinks for drips", "Inspect toilet base and connections", "Look for water stains on walls/ceilings", "Check water meter for continuous usage", "Test faucets and shut-off valves"]}',
  true, NOW(), NOW()
),
(
  'Test Water Pressure',
  'plumbing',
  'Test water pressure throughout the home to ensure adequate flow and identify issues.',
  2, 20, 6, ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
  ARRAY['single_family', 'townhouse', 'condo', 'apartment'],
  ARRAY['plumbing'],
  ARRAY['water pressure gauge'],
  NULL,
  'Proper water pressure ensures good performance of appliances and fixtures.',
  'Low pressure indicates clogs or pipe issues; high pressure can damage fixtures.',
  '{"steps": ["Attach pressure gauge to outdoor spigot", "Turn on water fully", "Read pressure (should be 40-60 PSI)", "Test multiple locations", "Note any significant variations"]}',
  true, NOW(), NOW()
),
(
  'Service Water Heater',
  'plumbing',
  'Annual water heater maintenance including flushing, inspection, and safety checks.',
  3, 90, 12, ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
  ARRAY['single_family', 'townhouse', 'condo'],
  ARRAY['water_heater'],
  ARRAY['garden hose', 'bucket'],
  ARRAY['wrench', 'screwdriver'],
  'Regular maintenance extends water heater life and maintains efficiency.',
  'Neglected water heaters lose efficiency and may fail prematurely, causing flooding.',
  '{"steps": ["Turn off power/gas to unit", "Connect hose to drain valve", "Open hot water faucet upstairs", "Drain tank partially", "Flush sediment", "Refill and restore power"]}',
  true, NOW(), NOW()
),

-- Electrical Category (2 more needed - we have "Test Smoke Detectors")
(
  'Test GFCI Outlets',
  'electrical',
  'Test all GFCI (Ground Fault Circuit Interrupter) outlets for proper safety function.',
  1, 15, 3, ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
  ARRAY['single_family', 'townhouse', 'condo', 'apartment'],
  ARRAY['electrical'],
  ARRAY['outlet tester (optional)'],
  NULL,
  'GFCI outlets prevent electrical shock and electrocution in wet areas.',
  'Faulty GFCI outlets pose serious shock and fire hazards, especially in bathrooms and kitchens.',
  '{"steps": ["Locate all GFCI outlets (bathrooms, kitchen, garage, outdoor)", "Press TEST button - outlet should turn off", "Press RESET button - outlet should turn on", "Test with small appliance", "Replace if not working properly"]}',
  true, NOW(), NOW()
),
(
  'Inspect Electrical Panel',
  'electrical',
  'Visual inspection of electrical panel for signs of wear, damage, or safety issues.',
  3, 30, 12, ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
  ARRAY['single_family', 'townhouse', 'condo'],
  ARRAY['electrical'],
  ARRAY['flashlight'],
  NULL,
  'Regular inspection identifies electrical hazards before they become dangerous.',
  'Electrical panel issues can cause fires, power outages, and electrocution.',
  '{"steps": ["Turn off main breaker", "Look for burn marks, rust, or corrosion", "Check for loose wires", "Ensure panel door closes properly", "Test main breaker operation", "Call electrician if issues found"]}',
  true, NOW(), NOW()
),

-- Exterior Category (2 more needed - we have "Clean Gutters")
(
  'Inspect Roof',
  'exterior',
  'Visual inspection of roof for damage, missing shingles, and potential leak sources.',
  3, 60, 12, ARRAY[4,5,9,10],
  ARRAY['single_family', 'townhouse'],
  ARRAY['roofing'],
  ARRAY['binoculars', 'camera'],
  ARRAY['ladder', 'safety harness'],
  'Early roof damage detection prevents costly water damage and structural issues.',
  'Unrepaired roof damage can lead to leaks, mold, and thousands in structural damage.',
  '{"steps": ["Inspect from ground with binoculars", "Look for missing/damaged shingles", "Check flashing around chimneys/vents", "Examine gutters for granules", "Document issues with photos", "Schedule professional inspection if needed"]}',
  true, NOW(), NOW()
),
(
  'Seal Driveway',
  'exterior',
  'Apply sealcoat to asphalt driveway to protect from weather and extend life.',
  3, 180, 24, ARRAY[5,6,7,8,9],
  ARRAY['single_family', 'townhouse'],
  ARRAY['driveway'],
  ARRAY['driveway sealer', 'squeegee', 'brush'],
  ARRAY['pressure washer', 'broom'],
  'Sealing protects asphalt from water damage, UV rays, and extends driveway life.',
  'Unsealed driveways crack and deteriorate, requiring expensive replacement.',
  '{"steps": ["Clean driveway thoroughly", "Fill cracks with crack filler", "Apply sealer with squeegee", "Work in sections", "Allow 24-48 hours to cure", "Avoid traffic during curing"]}',
  true, NOW(), NOW()
),

-- Interior Category (3 templates needed)
(
  'Deep Clean Home',
  'interior',
  'Thorough cleaning of all rooms including areas not covered in regular cleaning.',
  2, 240, 3, ARRAY[3,4,5,6,9,10,11],
  ARRAY['single_family', 'townhouse', 'condo', 'apartment'],
  NULL,
  ARRAY['cleaning supplies', 'microfiber cloths', 'vacuum cleaner'],
  ARRAY['mop', 'bucket', 'scrub brushes'],
  'Deep cleaning maintains healthy indoor environment and preserves home value.',
  'Neglected cleaning leads to allergen buildup, odors, and potential health issues.',
  '{"steps": ["Declutter all rooms", "Dust ceiling fans and light fixtures", "Clean baseboards and trim", "Vacuum/mop all floors", "Clean windows and mirrors", "Sanitize high-touch surfaces"]}',
  true, NOW(), NOW()
),
(
  'Check Windows and Doors',
  'interior',
  'Inspect windows and doors for proper operation, sealing, and security.',
  2, 45, 6, ARRAY[3,4,9,10,11],
  ARRAY['single_family', 'townhouse', 'condo', 'apartment'],
  NULL,
  ARRAY['weatherstripping', 'lubricant'],
  ARRAY['screwdriver', 'level'],
  'Proper window and door function ensures security, energy efficiency, and comfort.',
  'Faulty windows and doors increase energy costs and compromise home security.',
  '{"steps": ["Test all windows for smooth operation", "Check door locks and hinges", "Inspect weatherstripping for gaps", "Look for air leaks", "Lubricate hinges and locks", "Replace worn weatherstripping"]}',
  true, NOW(), NOW()
),
(
  'Touch Up Paint',
  'interior',
  'Touch up paint on walls, trim, and ceilings to maintain appearance and protection.',
  2, 120, 12, ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
  ARRAY['single_family', 'townhouse', 'condo', 'apartment'],
  NULL,
  ARRAY['touch-up paint', 'primer', 'brushes'],
  ARRAY['sandpaper', 'drop cloths', 'paint tray'],
  'Regular touch-ups maintain home appearance and protect surfaces from damage.',
  'Neglected paint allows moisture damage and reduces home value.',
  '{"steps": ["Identify areas needing touch-up", "Clean and sand damaged areas", "Apply primer if needed", "Match paint color carefully", "Apply thin coats", "Allow proper drying time"]}',
  true, NOW(), NOW()
),

-- Appliances Category (3 templates needed)
(
  'Clean Refrigerator Coils',
  'appliances',
  'Clean dust and debris from refrigerator coils to maintain efficiency.',
  2, 30, 6, ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
  ARRAY['single_family', 'townhouse', 'condo', 'apartment'],
  ARRAY['refrigerator'],
  ARRAY['vacuum cleaner', 'coil brush'],
  ARRAY['screwdriver'],
  'Clean coils improve efficiency and extend refrigerator life.',
  'Dirty coils make refrigerator work harder, increasing energy costs and shortening lifespan.',
  '{"steps": ["Unplug refrigerator", "Locate coils (back or bottom)", "Remove access panel if needed", "Vacuum loose debris", "Brush coils gently", "Vacuum again", "Replace panel and plug in"]}',
  true, NOW(), NOW()
),
(
  'Service Dishwasher',
  'appliances',
  'Clean dishwasher filter, spray arms, and interior to maintain performance.',
  2, 45, 12, ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
  ARRAY['single_family', 'townhouse', 'condo', 'apartment'],
  ARRAY['dishwasher'],
  ARRAY['dishwasher cleaner', 'white vinegar', 'baking soda'],
  ARRAY['old toothbrush', 'soft cloth'],
  'Regular maintenance prevents odors, improves cleaning, and extends dishwasher life.',
  'Neglected dishwashers develop clogs, odors, and poor cleaning performance.',
  '{"steps": ["Remove and clean bottom filter", "Clean spray arms with toothbrush", "Wipe door seals and interior", "Run empty cycle with dishwasher cleaner", "Clean exterior and controls"]}',
  true, NOW(), NOW()
),
(
  'Clean Dryer Vent',
  'appliances',
  'Clean lint from dryer vent system to prevent fires and improve efficiency.',
  2, 45, 6, ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
  ARRAY['single_family', 'townhouse', 'condo', 'apartment'],
  ARRAY['dryer'],
  ARRAY['dryer vent brush', 'vacuum cleaner'],
  ARRAY['screwdriver', 'flashlight'],
  'Clean vents prevent fires and reduce drying time and energy costs.',
  'Lint buildup causes 15,000 house fires annually and significantly increases energy usage.',
  '{"steps": ["Unplug dryer and move away from wall", "Disconnect vent hose", "Clean lint from hose and dryer interior", "Use brush to clean exterior vent", "Vacuum all lint", "Reconnect everything securely"]}',
  true, NOW(), NOW()
);

-- Update existing templates for consistency
UPDATE task_templates SET
  applies_to_home_types = ARRAY['single_family', 'townhouse', 'condo', 'apartment'],
  applies_to_equipment_types = ARRAY['hvac'],
  materials_needed = ARRAY['HVAC air filter'],
  tools_needed = ARRAY['screwdriver'],
  why_important = 'Clean air filters improve air quality, reduce energy costs, and extend HVAC system life.',
  consequences_if_skipped = 'Dirty filters reduce efficiency by 15%, increase energy bills, and can damage expensive HVAC equipment.',
  instructions = '{"steps": ["Turn off HVAC system", "Locate filter compartment", "Remove old filter", "Check filter size", "Insert new filter with airflow arrow pointing toward unit", "Turn system back on"]}'
WHERE title = 'Change HVAC Filter';

UPDATE task_templates SET
  applies_to_home_types = ARRAY['single_family', 'townhouse'],
  materials_needed = ARRAY['work gloves', 'trash bags', 'garden hose'],
  tools_needed = ARRAY['ladder', 'gutter scoop', 'safety harness'],
  why_important = 'Proper drainage prevents water damage to foundation and roof.',
  consequences_if_skipped = 'Clogged gutters can cause roof leaks, foundation damage, and ice dams.',
  instructions = '{"steps": ["Set up ladder safely", "Remove large debris by hand", "Scoop out remaining debris", "Flush gutters with hose", "Check downspouts for clogs", "Test water flow"]}'
WHERE title = 'Clean Gutters';

UPDATE task_templates SET
  applies_to_home_types = ARRAY['single_family', 'townhouse', 'condo', 'apartment'],
  applies_to_equipment_types = ARRAY['smoke_detector'],
  materials_needed = ARRAY['9V batteries'],
  tools_needed = ARRAY['step ladder'],
  why_important = 'Working smoke detectors save lives and are required by law in most areas.',
  consequences_if_skipped = 'Non-functioning detectors put lives at risk and may violate insurance requirements.',
  instructions = '{"steps": ["Press test button on each detector", "Listen for loud beep", "Replace batteries if beep is weak", "Clean detector with vacuum brush", "Record test date"]}'
WHERE title = 'Test Smoke Detectors';

-- Complete MVP - Final 2 templates and category fix
-- Move Test Smoke Detectors to electrical category and add 2 more templates

-- Move Test Smoke Detectors to electrical category (it's a safety electrical device)
UPDATE task_templates SET category = 'electrical' WHERE title = 'Test Smoke Detectors';

-- Add the final 2 templates to reach exactly 20 MVP templates
INSERT INTO task_templates (
  title, category, description, difficulty_level, estimated_duration_minutes,
  frequency_months, seasonal_months, applies_to_home_types, applies_to_equipment_types,
  materials_needed, tools_needed, why_important, consequences_if_skipped,
  instructions, active, created_at, updated_at
) VALUES 
-- Additional HVAC template
(
  'Check HVAC Thermostat',
  'hvac',
  'Test thermostat operation, calibration, and battery replacement for optimal climate control.',
  1, 20, 6, ARRAY[3,4,9,10],
  ARRAY['single_family', 'townhouse', 'condo', 'apartment'],
  ARRAY['hvac', 'thermostat'],
  ARRAY['AA batteries', 'soft cloth'],
  ARRAY['small screwdriver'],
  'Proper thermostat function ensures efficient heating/cooling and accurate temperature control.',
  'Faulty thermostats can cause 10-20% increase in energy bills and uncomfortable temperatures.',
  '{"steps": ["Test heating and cooling modes", "Check temperature accuracy with separate thermometer", "Replace batteries if needed", "Clean dust from unit", "Verify programming settings"]}',
  true, NOW(), NOW()
),
-- Additional Exterior template  
(
  'Inspect and Clean Exterior Siding',
  'exterior',
  'Clean and inspect home siding for damage, mold, and maintenance needs.',
  2, 90, 12, ARRAY[4,5,6,7,8,9],
  ARRAY['single_family', 'townhouse'],
  ARRAY['siding'],
  ARRAY['pressure washer or hose', 'mild detergent', 'soft brush'],
  ARRAY['ladder', 'safety equipment'],
  'Clean siding prevents damage, maintains curb appeal, and extends material life.',
  'Dirty or damaged siding can lead to moisture problems, pest issues, and reduced home value.',
  '{"steps": ["Inspect for cracks, holes, or loose pieces", "Remove debris and cobwebs", "Wash with appropriate cleaner", "Check caulking around windows and doors", "Document any repairs needed"]}',
  true, NOW(), NOW()
); 