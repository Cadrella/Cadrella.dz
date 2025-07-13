let element;

fetch('https://cadrella-back.onrender.com/fields')
    .then(response => response.json())
    .then(data => {
        setTimeout(() => {
            console.log('Received data:', data);
            fields_data = data;

            // Parse the HTML
            const dom = new JSDOM(data);
            const document = dom.window.document;

            // Extract the root element from the second HTML
            element = document2.body.children[1];
        }, 1000)
        
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

document.querySelectorAll('.field').forEach(element => {
    element.addEventListener('click', (event) => {
        event.preventDefault();

        document.querySelector('#main_content').remove();

        // Insert *after* the header element
        let header = document.querySelector('#header');
        header.parentNode.insertBefore(element, header.nextSibling);
    });
});