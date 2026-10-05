-- Sample content for local development:  npm run db:seed
INSERT INTO properties (slug, title, description, location, price, listing_type, property_type, beds, baths, size, tags, featured, published) VALUES
('modern-3-bedroom-maisonette-naivasha', 'Modern 3 Bedroom Maisonette', 'A bright, well-finished maisonette in a quiet gated community.' || char(10) || char(10) || 'Open-plan living, a fitted kitchen and a private garden. Title deed ready for transfer.', 'Kinamba, Naivasha', 12500000, 'sale', 'residential', 3, 2, '', '["Gated Community","Title Deed"]', 1, 1),
('one-acre-plot-naivasha', 'One Acre Plot', 'Flat, fenced land with road access and water on site. Ideal for farming or development.', 'Naivasha, Kenya', 3800000, 'sale', 'land', NULL, NULL, '1 acre', '["One Acre","Water On Site"]', 1, 1),
('one-bedroom-apartment-for-rent', 'One Bedroom Apartment', 'Secure one bedroom apartment close to town with parking and reliable water.', 'Naivasha Town', 18000, 'rent', 'residential', 1, 1, '', '["One Bedroom","Parking"]', 0, 1);

INSERT INTO property_images (property_id, url, position) VALUES
(1, '/assets/img/property-1.png', 0),
(2, '/assets/img/property-2.png', 0),
(3, '/assets/img/about.png', 0);

INSERT INTO posts (slug, title, excerpt, content, cover_image, category, read_minutes, published, published_at) VALUES
('why-naivasha-is-a-smart-place-to-invest', 'Why Naivasha Is a Smart Place to Invest', 'Naivasha continues to attract buyers and investors. Here is what is driving demand.', '<p>Naivasha sits on the Nairobi–Nakuru corridor, close to the lake, the flower farms and a growing number of residential developments.</p><h2>What is driving demand</h2><ul><li>Improved road access</li><li>Affordable land compared with Nairobi</li><li>A growing rental market</li></ul><p>Talk to us before you buy — we will help you verify titles and negotiate with confidence.</p>', '/assets/img/about-avihtech-1.jpg', 'Market Analysis', 1, 1, datetime('now'));
