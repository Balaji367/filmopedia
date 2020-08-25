const autocompleteconfig = {
    renderOption(movie){
        const imgSrc = movie.Poster === "N/A" ? '' : movie.Poster;
        return `
        <img src="${imgSrc}" />
        ${movie.Title} (${movie.Year})
        `;
    },
    inputValue(movie){
        return movie.Title;
    },
    async fetchData(searchTerm){
        const response = await axios.get('https://www.omdbapi.com/',{
            params: {
                apikey: '9ebdcbdc',
                s: searchTerm
            }
        });
        if(response.data.Error){
            return [];
        }
        return response.data.Search;
    }
};
autoComplete({
    ...autocompleteconfig,
    root: document.querySelector("#left-autocomplete"),
    onOptionSelect(movie){
        document.querySelector(".tutorial").classList.add("is-hidden");
        onMovieSelect(movie, document.querySelector("#left-summary"), "left");
    }
});
autoComplete({
    ...autocompleteconfig,
    root: document.querySelector("#right-autocomplete"),
    onOptionSelect(movie){
        document.querySelector(".tutorial").classList.add("is-hidden");
        onMovieSelect(movie, document.querySelector("#right-summary"), "right");
    }
});
let leftside;
let rightside;
const onMovieSelect = async (movie,summaryElement, side) => {
    const response = await axios.get('https://www.omdbapi.com/',{
        params: {
            apikey: '9ebdcbdc',
            i: movie.imdbID
        }
    });
    summaryElement.innerHTML = movieTemplate(response.data);
    if(side === "left"){
        leftside = response.data;
    }
    if(side === "right"){
        rightside = response.data;
    }
    if(leftside && rightside){
        runComparison();
    }
}
const runComparison = () => {
    const leftsidestats = document.querySelectorAll("#left-summary .notification");
    const rightsidestats = document.querySelectorAll("#right-summary .notification");
    leftsidestats.forEach((leftstat,index) => {
        const rightstat = rightsidestats[index];
        const leftsidevalue = leftstat.dataset.value;
        const rightsidevalue = rightstat.dataset.value;
        if(rightsidevalue > leftsidevalue){
            leftstat.classList.remove("is-primary");
            leftstat.classList.add("is-warning");
        }else if(rightsidevalue < leftsidevalue){
            rightstat.classList.remove("is-primary");
            rightstat.classList.add("is-warning");
        }else{
            rightstat.classList.remove("is-primary");
            rightstat.classList.add("is-danger");
            leftstat.classList.remove("is-primary");
            leftstat.classList.add("is-danger");
        }
    });
};
const movieTemplate = (movieDetails) => {
    const dollars = parseInt(movieDetails.BoxOffice.replace(/\$/g,'').replace(/,/g,''));
    const Metascore = parseInt(movieDetails.Metascore);
    const imdbRating = parseFloat(movieDetails.imdbRating);
    const imdbVotes = parseFloat(movieDetails.imdbVotes.replace(/,/g,''));
    const Awards = movieDetails.Awards.split(" ").reduce((prev , word) => {
        const value = parseInt(word);
        if(isNaN(value)){
            return prev;
        }else{
            return prev + value;
        }
    }, 0);
    return `
    <article class="media">
        <figure class="media-left">
            <p class="image">
                <img src="${movieDetails.Poster}" />
            </p>
        </figure>
        <div class="media-content">
            <div class="content">
                <h1>${movieDetails.Title} (${movieDetails.Year})</h1>
                <h3>RELEASED: ${movieDetails.Released}</h3>
                <h4>${movieDetails.Genre}</h4>
                <p>${movieDetails.Plot}</p>
                <h4>DIRECTOR: ${movieDetails.Director}</h4>
                <h4>ACTORS: ${movieDetails.Actors}</h4>
                <h4>LANGAGE: ${movieDetails.Language}</h4>
                <h4>COUNTRY: ${movieDetails.Country}</h4>
                <h4>WRITER: ${movieDetails.Writer}</h4>
            </div>
        </div>
    </article>
    <article data-value=${Awards} class="notification is-primary">
        <p class="title">${movieDetails.Awards}</p>
        <p class="subtitle">Awards</p>
    </article>
    <article data-value=${dollars} class="notification is-primary">
        <p class="title">${movieDetails.BoxOffice}</p>
        <p class="subtitle">Boxoffice</p>
    </article>
    <article data-value=${Metascore} class="notification is-primary">
        <p class="title">${movieDetails.Metascore}</p>
        <p class="subtitle">Metascore</p>
    </article>
    <article data-value=${imdbRating} class="notification is-primary">
        <p class="title">${movieDetails.imdbRating}</p>
        <p class="subtitle">IMDB Rating</p>
    </article>
    <article data-value=${imdbVotes} class="notification is-primary">
        <p class="title">${movieDetails.imdbVotes}</p>
        <p class="subtitle">IMDB Votes</p>
    </article>
    `;
}