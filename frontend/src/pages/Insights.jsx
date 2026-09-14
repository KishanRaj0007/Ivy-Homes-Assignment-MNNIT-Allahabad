export default function Insights() {
  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>Data Analytics & API Discrepancies</h2>
      <p>This dashboard displays the verified ground truth, overriding the faulty API documentation.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginTop: '20px' }}>
        
        {/* Analytics Column */}
        <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
          <h3>Verified Real Estate Metrics</h3>
          <ul style={{ lineHeight: '1.8' }}>
            <li><strong>Total Retrievable Listings:</strong> 3,800</li>
            <li><strong>Actual Unique Properties:</strong> 50</li>
            <li><strong>Active Listings (is_live):</strong> 3,344</li>
            <li><strong>Average 2BHK Price:</strong> ₹14,729.10 / sqft</li>
            <li><strong>Total Rent (Perungudi):</strong> ₹3,291,500 / month</li>
            <li><strong>Costliest Project:</strong> P40035 (₹93.7 Crores)</li>
            <li><strong>Listings Last 7 Days:</strong> 76</li>
          </ul>
        </div>

        {/* The "Lies" Column */}
        <div style={{ background: '#fdeced', padding: '20px', borderRadius: '8px' }}>
          <h3>Documented Lies & API Anomalies</h3>
          
          <h4>Authentication Traps</h4>
          <ul>
            <li><strong>Headers vs Params:</strong> API key must be sent in the <code>X-API-Key</code> header, not as a query parameter.</li>
            <li><strong>Response Keys:</strong> Returns <code>access_token</code>, not <code>token</code>.</li>
            <li><strong>Session Expiry:</strong> Tokens expire in 15 minutes (900s) and require a refresh flow, contradicting the promised 24-hour lifespan.</li>
          </ul>

          <h4>Pagination & Data Padding</h4>
          <ul>
            <li><strong>Silent Limits:</strong> Requesting <code>limit=200</code> is silently capped at 50 records per page.</li>
            <li><strong>Infinite Looping:</strong> Out-of-bounds pages never return an empty array. The server loops/pads data endlessly, causing standard scrapers to run forever.</li>
            <li><strong>Total Record Mismatch:</strong> The reported <code>total</code> of 3,768 listings is false; paging to the end yields 3,800 due to padding the final page to hit the 50-item quota.</li>
          </ul>

          <h4>Data Integrity & Units</h4>
          <ul>
            <li><strong>Massive Duplication:</strong> Only 50 distinct physical properties exist; they are duplicated 76 times each to simulate a 3,800 record database.</li>
            <li><strong>Unit Deception:</strong> Project prices are in Crores and Lakhs, contradicting the claim that all money is in raw integer Rupees.</li>
            <li><strong>Filter Failure:</strong> Inactive (dead) properties are NOT excluded server-side and require manual client-side filtering.</li>
            <li><strong>Timestamp Omissions:</strong> Listing timestamps lack the promised <code>Z</code> (UTC) suffix.</li>
            <li><strong>Count Falsification:</strong> 387 projects report mathematically incorrect <code>total_listings</code> counts.</li>
          </ul>
        </div>
        
      </div>
    </div>
  );
}