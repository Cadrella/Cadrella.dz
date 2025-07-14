const http = require('http');
const { JSDOM } = require('jsdom');

const { createClient } = require('@supabase/supabase-js');

const cloudinary = require('cloudinary').v2;

// For file serving
const fs = require('fs');
const path = require('path');
const { createTracing } = require('trace_events');

// Initialize Supabase
const supabaseUrl = 'https://ijhvfampizuvqwjwtyqt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaHZmYW1waXp1dnF3and0eXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNjk2MTQsImV4cCI6MjA2MDc0NTYxNH0.vyRMSFf7fAOSAFxilMZipIHqzg-1xbn5OnsZZhk7CaM';
const supabase = createClient(supabaseUrl, supabaseKey);

// JSON Response Helper
function writeJSON(res, statusCode, data) {
  setCORSHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Define the async function
async function supabaseGetFieldsJSON() {
    console.log('heeeeeeeeeeeeeeeeeeeeee');
    const { data, error } = await supabase
      .from('fields')
      .select('*');
  
    if (error) {
      console.error('Error fetching data:', error.message);
      return null;
    }
  
    //console.log('Products:', data);
    return data;
}
  
// Define the async function
async function supabaseGetCatalogsJSON() {
    const { data, error } = await supabase
      .from('catalogs')
      .select('*');
  
    if (error) {
      console.error('Error fetching data:', error.message);
      return null;
    }
  
    //console.log('Products:', data);
    return data;
}
  
// Define the async function
async function supabaseGetProductsJSON() {
    const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('product_id', {ascending: true});

    if (error) {
    console.error('Error fetching data:', error.message);
    return null;
    }

    //console.log('Products:', data);
    return data;
}

// Get data early
let supabaseGetFieldsJSONVariable;
let supabaseGetCatalogsJSONVariable;
let supabaseGetProductsJSONVariable;

( async () => {
  supabaseGetFieldsJSONVariable = await supabaseGetFieldsJSON();
  supabaseGetCatalogsJSONVariable = await supabaseGetCatalogsJSON();
  supabaseGetProductsJSONVariable = await supabaseGetProductsJSON();
})();

let HTMLBaseFile;

const filePath = path.join(__dirname, 'HTML.html');
    
  fs.readFile(filePath, (err, data) => {
      if (err) {
      console.error('Error reading file:', err);
      return;
      }
      HTMLBaseFile = data;
});

function parseAndSerialize(baseFile, addedElements) {
  // Parse the first one
  const dom1 = new JSDOM(baseFile);
  const document1 = dom1.window.document;
  
  // Parse the second one
  const dom2 = new JSDOM(addedElements);
  const document2 = dom2.window.document

  
  // Extract the root element from the second HTML
  const innerElement = document2.body.firstElementChild;
  if (!innerElement) {
  throw new Error('No root element found in addedElements.');
  }

  // Find where to insert it in the first DOM
  const container = document1.body;

  // Find the element after which to insert — here hardcoded as 'header'
  const afterElement = container.querySelector('#collections');
  if (!afterElement) {
    throw new Error('Element with id="header" not found in baseFile.');
  }

  // Import the node from dom2 to dom1
  const imported = document1.importNode(innerElement, true);

  // Insert *after* the header element
  if (afterElement.nextSibling) {
    container.insertBefore(imported, afterElement.nextSibling);
  } else {
    container.appendChild(imported);
  }

  // Return the updated HTML as string
  return dom1.serialize();
}

const server = http.createServer(async (req, res) => {
  
    // Add CORS headers to allow requests from any origin (you can replace * with a specific domain if needed)
    // Handle CORS for ALL requests
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins (you can restrict if needed)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allowed methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allowed headers

    if(req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    } else if(req.method === 'GET') {
        switch (req.url) {
            case '/': {
              try {
                 let data = supabaseGetFieldsJSONVariable;

                    let fields = '';
                    data.forEach(field => {

                        fields += `
                        <a href='https://cadrella-back.onrender.com/catalogs'>
                                    <section class="field">
                                        <section class="image_section">
                                            <img src="https://res.cloudinary.com/dcorvb30c/image/upload/v1751462940/02_1_qeqjsm.png" class="field_image" alt="Field Image">
                                        </section>
                                        <section class="field_name_section">
                                            <p class="field_name">${field.field_name} &nbsp; →</p>
                                        </section>
                                    </section>
                        </a>
                                    `;
                    })
                    //let allCatalogs = `<section id="main_content">${catalogs}</section>`;

                    let allFields = `<section id="main_content">${fields}</section>`;

                    let htmlToSend = parseAndSerialize(HTMLBaseFile, allFields);
                    //res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(htmlToSend);
                } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                }
            break;
          }
              
            case '/catalogs': {
                 try {
                 let data = supabaseGetCatalogsJSONVariable;

                    let catalogs = '';
                    data.forEach(catalog => {

                        catalogs += `
                        <a href='https://cadrella-back.onrender.com/products'>
                                    <section class="catalog">
                                        <section class="image_section">
                                            <img src="https://res.cloudinary.com/dcorvb30c/image/upload/v1751462940/02_1_qeqjsm.png" class="field_image" alt="Field Image">
                                        </section>
                                        <section class="field_name_section">
                                            <p class="field_name">${catalog.catalog_name} &nbsp; →</p>
                                        </section>
                                    </section>
                        </a>
                                    `;
                    })
                    //let allCatalogs = `<section id="main_content">${catalogs}</section>`;

                    let allCatalogs = `<section id="main_content">${catalogs}</section>`;

                    let htmlToSend = parseAndSerialize(HTMLBaseFile, allCatalogs);
                    //res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(htmlToSend);
                } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                }
              break;      
            }

            case '/products': {
                console.log('heeeeeeeeeeeeeeeeeeeeee');
                 try {
                 let data = supabaseGetProductsJSONVariable;

                    let products = '';
                    data.forEach(product => {

                        products += `
                        <!--<a href='https://cadrella-back.onrender.com/products'>-->
                                    <section class="product">
                                        <section class="image_section">
                                            <img src="https://res.cloudinary.com/dcorvb30c/image/upload/v1751462940/02_1_qeqjsm.png" class="field_image" alt="Field Image">
                                        </section>
                                        <section class="field_name_section">
                                            <p class="field_name">${product.product_name} &nbsp; →</p>
                                        </section>
                                    </section>
                        <!--</a>-->
                                    `;
                    })
                    //let allCatalogs = `<section id="main_content">${catalogs}</section>`;

                    let allProducts = `<section id="main_content">${products}</section>`;

                    let htmlToSend = parseAndSerialize(HTMLBaseFile, allProducts);
                    //res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(htmlToSend);
                } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                }
            break;
        }
      }      
    } else if (req.method === 'POST') {
        switch (req.url) {
            case '/order': {
                let body = '';

                req.on('data', chunk => {
                    body += chunk;
                });

                req.on('end', () => {
                    try {
                        const formObject = JSON.parse(body);
                        console.log('Received Form Object:', formObject);

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Form received successfully!' }));

                        insertProductsOrder(formObject);

                    } catch (error) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid JSON data' }));
                    }
                });
            }
            break;

            case '/personalize': {
                let body = '';

                req.on('data', chunk => {
                    body += chunk;
                });

                req.on('end', async () => {
                    try {
                        const formObject = JSON.parse(body);
                        console.log('Received Form Object:', formObject);

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Form received successfully!' }));

                        const imageUrl = await uploadBase64Image(formObject.image_input);

                        insertPersonalizeOrder(formObject, imageUrl);

                    } catch (error) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid JSON data' }));
                    }
                });
            }
            break;

            default:
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
                break;
        }
    }
});

server.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Cloudinary configuration
cloudinary.config({ 
    cloud_name: 'dcorvb30c', 
    api_key: '458852964626743', 
    api_secret: '5oCK7baiPPM_EW-iVnxVoKcUbWc' 
});

async function uploadBase64Image(base64) {
    const result = await cloudinary.uploader.upload(base64);
    console.log(result.secure_url);
    return result.secure_url; 
}

async function insertPersonalizeOrder(orderData, imageUrl) {
    const { data, error } = await supabase
    .from('personalized_orders')
    .insert([
        {
            customer_first_name: orderData.first_name,
            customer_last_name: orderData.last_name,
            customer_email: orderData.email,
            customer_phone_num: orderData.phone,
            customer_address: orderData.address,
            personalized_image: imageUrl,
            quantity: orderData.quantity
        }
    ])

    if(error) {
        console.error('Error inserting data', error);
    } else {
        console.log('Data inserted successfully', data);
    }
};

async function insertProductsOrder(orderData) {
    const { data, error } = await supabase
    .from('products_orders')
    .insert([
        {
            customer_first_name: orderData.first_name,
            customer_last_name: orderData.last_name,
            customer_email: orderData.email,
            customer_phone_num: orderData.phone,
            customer_address: orderData.address,
            quantity: orderData.quantity,
            product_id: orderData.product_id
        }
    ])

    if(error) {
        console.error('Error inserting data', error);
    } else {
        console.log('Data inserted successfully', data);
    }
};
