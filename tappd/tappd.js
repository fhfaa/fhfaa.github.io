(() => {
    let beers = [];
    const dataContainer = document.querySelector('#jsondata');
    const searchField = document.querySelector('#searchfield');
    const list = document.querySelector('#results');
    let searchTimeout = 0;

    const MAX_RESULTS = 15;

    // Prepare search/filter string:
    // trim, lowercase, remove diacritics (e.g. "äé" -> "ae"),
    // then remove all non-word-chars except "ß"
    const normalize = (str, fillNonWord = ' ') => str
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-z0-9ß ]/gi, fillNonWord)
        .trim();


    // Load beer data hidden div
    const loadBeers = () => {
        beers = JSON.parse(dataContainer.textContent);
        beers.forEach((beer) => {
            beer.normalName = normalize(beer.name, ' ');
            beer.normalBrewery = normalize(beer.brewery, ' ');
        });
    };


    // Show star rating (unless rating is 0 (means beer is from a list, not main export))
    const getStarsTemplate = (rating) => (rating
        ? `
            <div class="stars">
                <div class="full" style="width: ${Math.ceil(rating * 20)}%;">
                    <span>★★★★★</span>
                </div>
                <div class="empty">
                    <span>★★★★★</span>
                </div>
            </div>`
        : '');


    // Turns results into a HTML string and display it inside of the <ul>
    const renderResults = (results /* beer[] | null */) => {
        let contents = results !== null
            ? `
            <li>
                <h2 class="no-results">No results. New beer found? 🎉</h2>
            </li>`
            : '';

        if (results?.length) {
            // Slice results with a threshhold  of 1:
            // i.e. if MAX_RESULTS is 15 but we have 16 results, just show them all.
            // That also means we can say "X results" instead of "X result(s)", because it's always >=2
            const maxSliceIndex = results.length <= MAX_RESULTS + 1
                ? undefined
                : MAX_RESULTS;

            contents = results
                .slice(0, maxSliceIndex)
                .map((beer) => {
                    const location = beer.from
                        ? ` <span class="location">${beer.from}</span>`
                        : '';
                    const abv = beer.abv !== null
                        ? `<div class="abv">${beer.abv}% alc.</div>`
                        : '';

                    return `
                        <li>
                            <div class="left">
                                <h2>${beer.name}</h2>
                                <p class="brewery">${beer.brewery} ${location}</p>
                            </div>
                            <div class="right">
                                ${getStarsTemplate(beer.rating)}
                                ${abv}
                            </div>
                        </li>
                    `;
                })
                .join('');

            // "...and X more results"
            if (results.length > MAX_RESULTS + 1) {
                contents += `
                    <li>
                        <h2>... ${results.length - MAX_RESULTS} more results</h2>
                    </li>`;
            }
        }

        list.innerHTML = contents;
    };


    // Search the list of beers for our text
    const searchBeers = () => {
        // Normalize search text. Replace non-word chars with wildcards instead of spaces
        const searchStr = normalize(searchField.value, '.*?');

        if (!searchStr) {
            renderResults(null);
            return;
        }

        // Each of our search words must match the beginning of a word.
        // No need to escape regex specialchars as we filter out all non-word chars.
        const parts = searchStr
            .split(/\s+/)
            .map((part) => new RegExp(`\\b${part}`));

        // Filter:
        // Find all beers where all ALL our search words match either beer or brewery
        const matches = beers
            .filter((beer) => parts.every((part) => part.test(beer.normalName) || part.test(beer.normalBrewery)));

        // Sort:
        // Matching the beer name is worth more than matching the brewery name
        // Calculate the match score for each beer and use that for sorting
        //
        // Note: `searchScore` has no meaning outside of this specific search, but
        // it remains in the original obj and is overwritten on each search.
        for (const match of matches) {
            match.searchScore = parts
                .reduce((part) => (part.test(match.normalName) ? 3 : 0)
                    + (part.test(match.normalBrewery) ? 1 : 0));
        }

        matches.sort((a, b) => {
            if (a.searchScore !== b.searchScore) {
                return a.searchScore > b.searchScore ? -1 : 1;
            }
            return a.name < b.name ? -1 : 1;
        });

        // Render the sorted results
        renderResults(matches);
    };


    // Debounce search on searchfield input (150ms)
    searchField.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = 0;
        searchTimeout = setTimeout(searchBeers, 150);
    }, false);


    // Startup
    try {
        loadBeers();

        // Ready
        searchField.disabled = false;
        searchField.placeholder = 'Search for a beer...';
        searchField.focus();
    } catch (ex) {
        console.error('Error loading beers: ', ex);
        searchField.classList.add('error');
        searchField.placeholder = `Error loading beers: ${ex.message}`;
    }
})(); // dog balls >:(
