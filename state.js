window.addEventListener('popstate', (e) => {
    if(e.state && e.state.page === 'catalogsPage') {
        loadCatalogs();
    }
})