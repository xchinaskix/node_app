const axios = require('axios');
const dompurify = require('dompurify');

function searchResultHTML(stores) {
    return stores.map(store => {
        return `
        <a class="search__result" href="/store/${store.slug}">
        <strong>${store.name}</strong>
        </a>
        `
    }).join('');
}

function searchHandler(currIdx, listSize, dir) {
    const realDir = dir === 40;
    const realIdx = currIdx !== -1 ? currIdx : null;
    let idx;
    if (realIdx === null) {
        idx = realDir ? 0 : listSize - 1;
    } else {
        if (realDir) {
            idx = currIdx + 1 > listSize - 1 ? 0 : currIdx + 1;
        } else {
            idx = currIdx - 1 < 0 ? listSize - 1 : currIdx - 1;
        }
    }

    return idx;
}

function typeAhead(search) {
    const searchInput = search.querySelector('input[name="search"]');
    const searchResults = search.querySelector('.search__results');

    if (!searchInput) return;

    searchInput.on('input', function() {
        if (!this.value) {
            searchResults.style.display = 'none';
            return
        }
        
        searchResults.style.display = 'block';
        searchResults.innerHTML = '';

        axios
        .get(`/api/search?q=${this.value}`)
        .then(res => {
            if (res.data.length) {
                searchResults.innerHTML = dompurify.sanitize(searchResultHTML(res.data))
                return;
            }

            searchResults.innerHTML = dompurify.sanitize(`<div class='search__result'>No results for ${this.value}</div>`);
        })

    });

    searchInput.on('keyup', function(e) {
        if (![38, 40, 13].includes(e.keyCode)) return;
        const activeClass = 'search__result--active';
        if (!searchResults.children.length) return;
        const results = Array.from(searchResults.children);
        const currIdx = results.findIndex(i => i.classList.contains(activeClass));
        const resSize = results.length;
        results.forEach(i => i.classList.remove(activeClass));
        if ([38, 40].includes(e.keyCode)) {
            const idx = searchHandler(currIdx, resSize, e.keyCode);
            results[idx].classList.add(activeClass);
            console.log(idx);
        } else {
            if (currIdx === -1) return;
            results[currIdx].click();
        }
        
    });
}

export default typeAhead;