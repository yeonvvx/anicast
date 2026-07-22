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
    trending.results.slice(0,5);


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
        Watch
        </a>


        <button class="btn btn-ghost"
        id="heroWatchlistBtn">
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



    let active = 0;


    function setActive(i){

      active=i;

      hero.querySelectorAll(".hero-slide")
      .forEach(s=>
        s.classList.toggle(
          "active",
          +s.dataset.i===i
        )
      );


      hero.querySelectorAll(".hero-dot")
      .forEach(d=>
        d.classList.toggle(
          "active",
          +d.dataset.i===i
        )
      );


      const m=picks[i];


      document.getElementById("heroTitle")
      .textContent=CV.titleOf(m);


      document.getElementById("heroOverview")
      .textContent=m.overview || "";


      document.getElementById("heroPlayBtn")
      .href=`watch.html?type=movie&id=${m.id}`;

    }



    hero.querySelectorAll(".hero-dot")
    .forEach(dot=>{

      dot.onclick=()=>setActive(+dot.dataset.i);

    });



    let timer=setInterval(
      ()=>setActive((active+1)%picks.length),
      7000
    );



    hero.onmouseenter=()=>clearInterval(timer);

    hero.onmouseleave=()=>{

      timer=setInterval(
        ()=>setActive((active+1)%picks.length),
        7000
      );

    };


  }


  catch(e){

    hero.innerHTML =
    CV.emptyStateHTML(
      "Couldn't load trending titles",
      "Check your TMDB key."
    );

  }

}








function createShelfInfinite(
container,
title,
label,
endpoint,
extra={}
){


let page=1;
let totalPages=Infinity;
let loading=false;


const id =
"shelf-"+Math.random()
.toString(36)
.slice(2,8);


const trigger =
id+"-trigger";



const wrap =
document.createElement("div");


wrap.className="shelf";


wrap.innerHTML=`

<div class="shelf-head">

<div class="shelf-title">
${title}
</div>

<div class="shelf-count">
${label}
</div>

</div>


<div class="shelf-track" id="${id}">
${CV.skeletonHTML(8)}
</div>


<div id="${trigger}"
style="height:80px">
</div>

`;



container.appendChild(wrap);



const grid =
document.getElementById(id);



async function load(){


if(
loading ||
page>totalPages
)
return;


loading=true;


try{


const data =
await CV.tmdb(
endpoint,
{
page,
...extra
}
);


totalPages=data.total_pages;



grid.insertAdjacentHTML(
"beforeend",
data.results
.map(CV.cardHTML)
.join("")
);



page++;


}

catch(e){

console.error(e);

}


finally{

loading=false;

}


}




const observer =
new IntersectionObserver(
(entries)=>{

if(entries[0].isIntersecting){

load();

}

},
{
rootMargin:"600px"
}
);



observer.observe(
document.getElementById(trigger)
);



load();


}










async function buildShelves(){

const container =
document.getElementById("homeShelves");


container.innerHTML="";



createShelfInfinite(
container,
"Popular Movies",
"TMDB · popular",
"/movie/popular"
);



createShelfInfinite(
container,
"Popular TV Shows",
"TMDB · popular",
"/tv/popular"
);



createShelfInfinite(
container,
"Anime",
"animation · JP",
"/discover/tv",
{
with_genres:CV.animeGenreId,
with_origin_country:"JP",
sort_by:"popularity.desc"
}
);



createShelfInfinite(
container,
"Top Rated Movies",
"TMDB · top rated",
"/movie/top_rated"
);



createShelfInfinite(
container,
"Upcoming",
"in theaters soon",
"/movie/upcoming"
);


}
