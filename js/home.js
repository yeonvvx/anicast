document.addEventListener("DOMContentLoaded", async () => {

  CV.initTopSearch();

  const ready = await CV.checkApiKey();

  if (!ready) {
    document.getElementById("hero").innerHTML =
      CV.configNoticeHTML();
    return;
  }


  await buildHero();
  await buildShelves();

});





async function buildHero() {

  const hero =
    document.getElementById("hero");


  try {

    const trending =
      await CV.tmdb("/trending/movie/week");


    const picks =
      trending.results.slice(0, 5);



    hero.innerHTML = `

      ${picks.map((m,i)=>`

        <div class="hero-slide ${i===0?"active":""}"
        data-i="${i}"
        style="background-image:url('${CV.IMG.backdrop(m.backdrop_path) || ""}')">
        </div>

      `).join("")}


      <div class="hero-scrim"></div>


      <div class="hero-body">


        <div class="hero-eyebrow">
          TRENDING THIS WEEK
        </div>


        <h1 class="hero-title" id="heroTitle">
          ${CV.titleOf(picks[0])}
        </h1>



        <div class="hero-meta" id="heroMeta">

          <span class="badge rating">
            ★ ${picks[0].vote_average.toFixed(1)}
          </span>


          <span class="badge">
            ${CV.yearOf(picks[0])}
          </span>


          <span class="badge">
            Movie
          </span>

        </div>



        <p class="hero-overview" id="heroOverview">
          ${picks[0].overview || ""}
        </p>




        <div class="hero-actions">


          <a class="btn btn-primary"
          id="heroPlayBtn"
          href="watch.html?type=movie&id=${picks[0].id}">

            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7L8 5Z"/>
            </svg>

            Watch

          </a>



          <button class="btn btn-ghost"
          id="heroWatchlistBtn">

            <svg viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8">

              <path d="M6 4h12v17l-6-4-6 4V4Z"/>

            </svg>

            Watchlist

          </button>


        </div>


      </div>




      <div class="hero-dots">

        ${picks.map((_,i)=>`

          <div class="hero-dot ${i===0?"active":""}"
          data-i="${i}">
          </div>

        `).join("")}

      </div>

    `;



    let activeIdx = 0;



    function setActive(i){

      activeIdx = i;



      hero.querySelectorAll(".hero-slide")
      .forEach(slide=>{

        slide.classList.toggle(
          "active",
          +slide.dataset.i === i
        );

      });



      hero.querySelectorAll(".hero-dot")
      .forEach(dot=>{

        dot.classList.toggle(
          "active",
          +dot.dataset.i === i
        );

      });



      const movie =
      picks[i];


      document.getElementById("heroTitle")
      .textContent =
      CV.titleOf(movie);



      document.getElementById("heroOverview")
      .textContent =
      movie.overview || "";



      document.getElementById("heroMeta")
      .innerHTML = `

        <span class="badge rating">
          ★ ${movie.vote_average.toFixed(1)}
        </span>


        <span class="badge">
          ${CV.yearOf(movie)}
        </span>


        <span class="badge">
          Movie
        </span>

      `;



      document.getElementById("heroPlayBtn")
      .href =
      `watch.html?type=movie&id=${movie.id}`;

    }





    hero.querySelectorAll(".hero-dot")
    .forEach(dot=>{

      dot.addEventListener(
        "click",
        ()=>setActive(+dot.dataset.i)
      );

    });



    let timer =
    setInterval(()=>{

      setActive(
        (activeIdx + 1) % picks.length
      );

    },7000);



    hero.addEventListener(
      "mouseenter",
      ()=>clearInterval(timer)
    );



    hero.addEventListener(
      "mouseleave",
      ()=>{

        timer =
        setInterval(()=>{

          setActive(
            (activeIdx + 1) % picks.length
          );

        },7000);

      }
    );



    document
    .getElementById("heroWatchlistBtn")
    .addEventListener(
      "click",
      e=>{

        const inList =
        CV.toggleWatchlist(
          picks[activeIdx],
          "movie"
        );


        e.currentTarget.innerHTML =
        inList ?
        "✓ In Watchlist" :
        "Watchlist";

      }
    );



  }


  catch(e){

    console.error(e);

    hero.innerHTML =
    CV.emptyStateHTML(
      "Couldn't load trending titles",
      "Check your connection or TMDB key and refresh."
    );

  }

}
function enableDragScroll(element){

  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let velocity = 0;
  let animationFrame;


  element.addEventListener("mousedown", (e)=>{

    isDown = true;

    element.classList.add("dragging");


    startX =
      e.pageX - element.offsetLeft;


    scrollLeft =
      element.scrollLeft;


    velocity = 0;


    cancelAnimationFrame(animationFrame);


    e.preventDefault();

  });



  document.addEventListener("mouseup", ()=>{

    if(!isDown) return;


    isDown = false;

    element.classList.remove("dragging");


    startMomentum();

  });



  element.addEventListener("mouseleave", ()=>{

    if(!isDown) return;


    isDown = false;

    element.classList.remove("dragging");


    startMomentum();

  });



  element.addEventListener("mousemove", (e)=>{

    if(!isDown) return;


    e.preventDefault();


    const x =
      e.pageX - element.offsetLeft;


    const walk =
      x - startX;


    velocity =
      walk * -0.8;


    element.scrollLeft =
      scrollLeft - walk * 1.5;

  });



  function startMomentum(){

    element.scrollLeft += velocity;


    velocity *= 0.92;


    if(Math.abs(velocity) > 0.5){

      animationFrame =
      requestAnimationFrame(
        startMomentum
      );

    }

  }



  element.addEventListener(
    "dragstart",
    e=>e.preventDefault()
  );

}








function buildShelfInto(
  container,
  title,
  countLabel,
  endpoint,
  params = {}
){

  const id =
  "shelf-" +
  Math.random()
  .toString(36)
  .slice(2,8);



  const wrap =
  document.createElement("div");


  wrap.className = "shelf";


  wrap.innerHTML = `

    <div class="shelf-head">

      <div class="shelf-title">
        ${title}
      </div>


      <div class="shelf-count">
        ${countLabel}
      </div>

    </div>


    <div class="shelf-track" id="${id}">
      ${CV.skeletonHTML(8)}
    </div>

  `;


  container.appendChild(wrap);



  const track =
  document.getElementById(id);



  let page = 1;

  let totalPages = Infinity;

  let loading = false;




  async function loadMore(){


    if(
      loading ||
      page > totalPages
    ){

      return;

    }


    loading = true;



    try{


      const data =
      await CV.tmdb(
        endpoint,
        {
          page,
          ...params
        }
      );



      totalPages =
      data.total_pages;



      if(page === 1){

        track.innerHTML = "";

      }



      track.insertAdjacentHTML(
        "beforeend",
        data.results
        .map(CV.cardHTML)
        .join("")
      );



      page++;


    }


    catch(e){

      console.error(
        "Shelf loading error:",
        e
      );

    }


    finally{

      loading = false;

    }

  }




  // first batch
  loadMore();



  // mouse drag scrolling
  enableDragScroll(track);



  // infinite loading
  track.addEventListener(
    "scroll",
    ()=>{


      if(
        track.scrollLeft +
        track.clientWidth >=
        track.scrollWidth - 300
      ){

        loadMore();

      }


    }
  );


}









async function buildShelves(){

  const container =
  document.getElementById("homeShelves");


  container.innerHTML = "";



  buildShelfInto(
    container,
    "Popular Movies",
    "TMDB · popular",
    "/movie/popular"
  );



  buildShelfInto(
    container,
    "Popular TV Shows",
    "TMDB · popular",
    "/tv/popular"
  );



  buildShelfInto(
    container,
    "Anime",
    "animation · JP",
    "/discover/tv",
    {
      with_genres: CV.animeGenreId,
      with_origin_country:"JP",
      sort_by:"popularity.desc"
    }
  );



  buildShelfInto(
    container,
    "Top Rated Movies",
    "TMDB · top rated",
    "/movie/top_rated"
  );



  buildShelfInto(
    container,
    "Upcoming",
    "in theaters soon",
    "/movie/upcoming"
  );

}
