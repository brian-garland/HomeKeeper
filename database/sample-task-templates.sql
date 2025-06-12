-- Sample Task Templates for HomeKeeper Intelligent Task Generation
-- These templates will be used to generate personalized maintenance schedules

-- HVAC System Templates
INSERT INTO task_templates (
  title, category, description, difficulty_level, estimated_duration_minutes,
  frequency_months, frequency_type, seasonal_months, applies_to_home_types,
  applies_to_equipment_types, materials_needed, tools_needed, why_important,
  consequences_if_skipped, money_saved_estimate, instructions, active, system_template
) VALUES 
(
  'Change HVAC Air Filter',
  'HVAC',
  'Replace the air filter in your heating and cooling system to maintain air quality and system efficiency.',
  2, 15, 3, 'recurring', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
  ARRAY['single_family', 'townhouse', 'condo', 'apartment'],
  ARRAY['hvac', 'furnace', 'air_conditioner'],
  ARRAY['HVAC air filter', 'disposable gloves'],
  ARRAY['screwdriver'],
  'Clean air filters improve air quality, reduce energy costs, and extend HVAC system life.',
  'Dirty filters reduce efficiency by 15%, increase energy bills, and can damage expensive HVAC equipment.',
  50,
  '{"steps": ["Turn off HVAC system", "Locate filter compartment", "Remove old filter", "Check filter size", "Insert new filter with airflow arrow pointing toward unit", "Turn system back on"]}',
  true, true
),
(
  'Clean HVAC Vents and Registers',
  'HVAC',
  'Clean air vents and return registers to improve airflow and indoor air quality.',
  2, 45, 6, 'recurring', ARRAY[3,4,9,10],
  ARRAY['single_family', 'townhouse', 'condo', 'apartment'],
  ARRAY['hvac'],
  ARRAY['vacuum cleaner', 'microfiber cloths', 'mild soap'],
  ARRAY['screwdriver', 'vacuum with brush attachment'],
  'Clean vents improve airflow efficiency and reduce dust circulation.',
  'Blocked vents reduce system efficiency and can cause uneven heating/cooling.',
  25,
  '{"steps": ["Remove vent covers", "Vacuum inside ducts as far as reachable", "Wash vent covers with soap and water", "Dry completely", "Reinstall covers"]}',
  true, true
),

-- Seasonal Maintenance Templates
(
  'Winterize Outdoor Faucets',
  'Plumbing',
  'Prepare outdoor water faucets for winter to prevent freezing and pipe damage.',
  2, 30, 12, 'seasonal', ARRAY[10,11],
  ARRAY['single_family', 'townhouse'],
  NULL,
  ARRAY['faucet covers', 'pipe insulation'],
  ARRAY['wrench', 'screwdriver'],
  'Prevents costly pipe bursts from freezing temperatures.',
  'Frozen pipes can burst, causing thousands in water damage.',
  500,
  '{"steps": ["Shut off water to outdoor faucets", "Drain remaining water", "Install faucet covers", "Insulate exposed pipes", "Check for leaks"]}',
  true, true
),
(
  'Clean Gutters and Downspouts',
  'Exterior',
  'Remove leaves, debris, and blockages from gutters to ensure proper water drainage.',
  3, 120, 6, 'seasonal', ARRAY[4,5,10,11],
  ARRAY['single_family', 'townhouse'],
  NULL,
  ARRAY['work gloves', 'trash bags', 'garden hose'],
  ARRAY['ladder', 'gutter scoop', 'safety harness'],
  'Proper drainage prevents water damage to foundation and roof.',
  'Clogged gutters can cause roof leaks, foundation damage, and ice dams.',
  1000,
  '{"steps": ["Set up ladder safely", "Remove large debris by hand", "Scoop out remaining debris", "Flush gutters with hose", "Check downspouts for clogs", "Test water flow"]}',
  true, true
),

-- Spring Maintenance Templates
(
  'Inspect and Clean Deck/Patio',
  'Exterior',
  'Inspect deck or patio for winter damage and clean for spring use.',
  2, 90, 12, 'seasonal', ARRAY[3,4,5],
  ARRAY['single_family', 'townhouse'],
  ARRAY['deck', 'patio'],
  ARRAY['deck cleaner', 'scrub brush', 'garden hose'],
  ARRAY['pressure washer (optional)', 'safety glasses'],
  'Regular maintenance extends deck life and prevents safety hazards.',
  'Neglected decks can develop rot, loose boards, and safety issues.',
  200,
  '{"steps": ["Inspect for loose boards or nails", "Check railings for stability", "Sweep debris", "Apply deck cleaner", "Scrub surface", "Rinse thoroughly", "Allow to dry"]}',
  true, true
),
(
  'Service Lawn Mower',
  'Landscaping',
  'Prepare lawn mower for spring with oil change, blade sharpening, and tune-up.',
  3, 60, 12, 'seasonal', ARRAY[3,4],
  ARRAY['single_family', 'townhouse'],
  ARRAY['lawn_mower'],
  ARRAY['motor oil', 'spark plug', 'air filter'],
  ARRAY['wrench set', 'oil drain pan', 'funnel'],
  'Well-maintained mowers start easily and cut grass effectively.',
  'Poor maintenance leads to hard starting, uneven cuts, and expensive repairs.',
  150,
  '{"steps": ["Change engine oil", "Replace spark plug", "Clean/replace air filter", "Sharpen blade", "Check tire pressure", "Test start"]}',
  true, true
),

-- Fall Maintenance Templates
(
  'Inspect and Clean Chimney',
  'HVAC',
  'Professional chimney inspection and cleaning before heating season.',
  4, 180, 12, 'seasonal', ARRAY[9,10],
  ARRAY['single_family', 'townhouse'],
  ARRAY['fireplace', 'wood_stove'],
  ARRAY['professional service'],
  NULL,
  'Clean chimneys prevent fires and carbon monoxide poisoning.',
  'Dirty chimneys can cause house fires and deadly carbon monoxide leaks.',
  2000,
  '{"steps": ["Schedule professional inspection", "Check for animal nests", "Verify damper operation", "Test smoke and carbon monoxide detectors", "Stock up on seasoned firewood"]}',
  true, true
),
(
  'Seal Windows and Doors',
  'Weatherproofing',
  'Check and replace weatherstripping around windows and doors for winter efficiency.',
  2, 120, 12, 'seasonal', ARRAY[9,10,11],
  ARRAY['single_family', 'townhouse', 'condo'],
  NULL,
  ARRAY['weatherstripping', 'caulk', 'foam sealant'],
  ARRAY['caulk gun', 'utility knife', 'measuring tape'],
  'Proper sealing reduces heating costs by up to 20%.',
  'Air leaks increase heating bills and reduce comfort.',
  300,
  '{"steps": ["Check all windows for drafts", "Remove old weatherstripping", "Measure and cut new strips", "Install weatherstripping", "Caulk gaps around frames", "Test door seals"]}',
  true, true
),

-- Monthly/Routine Maintenance Templates
(
  'Test Smoke and Carbon Monoxide Detectors',
  'Safety',
  'Test all smoke and carbon monoxide detectors and replace batteries if needed.',
  1, 15, 1, 'recurring', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
  ARRAY['single_family', 'townhouse', 'condo', 'apartment'],
  ARRAY['smoke_detector', 'carbon_monoxide_detector'],
  ARRAY['9V batteries', 'AA batteries'],
  ARRAY['step ladder'],
  'Working detectors save lives and are required by law in most areas.',
  'Non-functioning detectors put lives at risk and may violate insurance requirements.',
  0,
  '{"steps": ["Press test button on each detector", "Listen for loud beep", "Replace batteries if beep is weak", "Clean detector with vacuum brush", "Record test date"]}',
  true, true
),
(
  'Clean Kitchen Range Hood Filter',
  'Kitchen',
  'Clean or replace the grease filter in your kitchen range hood.',
  2, 20, 3, 'recurring', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
  ARRAY['single_family', 'townhouse', 'condo', 'apartment'],
  ARRAY['range_hood'],
  ARRAY['degreasing cleaner', 'hot water', 'dish soap'],
  ARRAY['scrub brush'],
  'Clean filters improve ventilation and reduce fire risk.',
  'Grease buildup can cause fires and poor air quality.',
  100,
  '{"steps": ["Remove filter from range hood", "Soak in hot soapy water", "Scrub with degreasing cleaner", "Rinse thoroughly", "Dry completely", "Reinstall filter"]}',
  true, true
),

-- Equipment-Specific Templates
(
  'Flush Water Heater',
  'Plumbing',
  'Drain and flush water heater to remove sediment and maintain efficiency.',
  3, 90, 12, 'recurring', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
  ARRAY['single_family', 'townhouse', 'condo'],
  ARRAY['water_heater'],
  ARRAY['garden hose'],
  ARRAY['wrench', 'screwdriver'],
  'Flushing removes sediment that reduces efficiency and shortens tank life.',
  'Sediment buildup reduces efficiency by 25% and can cause premature failure.',
  200,
  '{"steps": ["Turn off power/gas to water heater", "Connect hose to drain valve", "Open hot water faucet upstairs", "Open drain valve", "Flush until water runs clear", "Close valves and restore power"]}',
  true, true
),
(
  'Clean Dryer Vent',
  'Laundry',
  'Clean lint from dryer vent to prevent fires and improve efficiency.',
  2, 45, 6, 'recurring', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
  ARRAY['single_family', 'townhouse', 'condo', 'apartment'],
  ARRAY['dryer'],
  ARRAY['dryer vent brush', 'vacuum cleaner'],
  ARRAY['screwdriver', 'flashlight'],
  'Clean vents prevent fires and reduce drying time.',
  'Lint buildup causes 15,000 house fires annually and increases energy costs.',
  150,
  '{"steps": ["Unplug dryer", "Disconnect vent hose", "Clean lint from hose", "Use brush to clean vent pipe", "Vacuum lint from dryer interior", "Reconnect everything"]}',
  true, true
);

-- Add more specialized templates for different home types and equipment
INSERT INTO task_templates (
  title, category, description, difficulty_level, estimated_duration_minutes,
  frequency_months, applies_to_home_types, climate_conditions,
  why_important, consequences_if_skipped, money_saved_estimate, active, system_template
) VALUES 
(
  'Inspect Roof for Storm Damage',
  'Roofing',
  'Visual inspection of roof for loose shingles, damage, or potential leaks.',
  2, 30, 6,
  ARRAY['single_family', 'townhouse'],
  ARRAY['stormy', 'windy', 'hail'],
  'Early detection prevents small problems from becoming major repairs.',
  'Undetected roof damage can lead to leaks and structural damage.',
  1500,
  true, true
),
(
  'Check Basement for Water Issues',
  'Foundation',
  'Inspect basement or crawl space for signs of water intrusion or moisture problems.',
  2, 45, 6,
  ARRAY['single_family', 'townhouse'],
  ARRAY['humid', 'rainy'],
  'Early detection prevents mold and structural damage.',
  'Water damage can cause expensive foundation repairs and health issues.',
  3000,
  true, true
),
(
  'Trim Trees Near House',
  'Landscaping',
  'Trim tree branches that are too close to the house or power lines.',
  4, 180, 12,
  ARRAY['single_family', 'townhouse'],
  ARRAY['windy', 'stormy'],
  'Prevents damage from falling branches during storms.',
  'Overhanging branches can damage roof, siding, and power lines.',
  2000,
  true, true
); 