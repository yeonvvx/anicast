let browseType = "movie";
let browseGenre = null;

let currentPage = 1;
let totalPages = Infinity;
let loading = false;

let infiniteObserver = null;


document.addEventListener("DOMContentLoaded", async () => {

  CV.initTopSearch();

  const ready = await CV.checkApiKey();

  if (!ready) {

    document.getElementById("browseGrid").innerHTML =
      CV.configNoticeHTML();

    return;

  }


  document.querySelectorAll("#browseTypeChips .chip")
  .forEach((chip)=>{

    chip.addEventListener("click",()=>{

      browseType = chip.dataset.type;


      document
      .querySelectorAll("#browseTypeChips .chip")
      .forEach(c=>c.classList.remove("active"));


      chip.classList.add("active");


      loadGenres();

    });

  });


  loadGenres();


});





async function loadGenres(){

  const chipRow =
  document.getElementById("browseGenreChips");


  chipRow.innerHTML = `
    <div class="section-note" style="padding:0;">
      loading genres…
    </div>
  `;


  try {


    const data =
    await CV.tmdb(`/genre/${browseType}/list`);


    browseGenre =
    data.genres[0].id;



    chipRow.innerHTML =
    data.genres.map((g,i)=>`

      <button class="chip ${i===0?"active":""}"
      data-genre="${g.id}">

      ${g.name}

      </button>

    `).join("");




    chipRow.querySelectorAll(".chip")
    .forEach(chip=>{


      chip.addEventListener("click",()=>{


        browseGenre =
        Number(chip.dataset.genre);



        chipRow
        .querySelectorAll(".chip")
        .forEach(c=>c.classList.remove("active"));



        chip.classList.add("active");


        resetGrid();

        loadGrid();


      });


    });



    resetGrid();

    loadGrid();


  }

  catch(e){

    console.error(e);


    chipRow.innerHTML = "";


    document.getElementById("browseGrid").innerHTML =
    CV.emptyStateHTML(
      "Couldn't load genres",
      "Check your connection or TMDB key."
    );

  }

}







function resetGrid(){

  const grid =
  document.getElementById("browseGrid");


  grid.innerHTML =
  CV.skeletonHTML(18);



  currentPage = 1;

  totalPages = Infinity;



  createInfiniteObserver();

}








async function loadGrid(){

  const grid =
  document.getElementById("browseGrid");


  if(
    loading ||
    currentPage > totalPages
  ){

    return;

  }



  loading = true;



  try {


    const data =
    await CV.tmdb(
      `/discover/${browseType}`,
      {
        page: currentPage,
        with_genres: browseGenre,
        sort_by:"popularity.desc"
      }
    );



    totalPages =
    data.total_pages;



    const html =
    data.results
    .map(CV.cardHTML)
    .join("");




    if(currentPage === 1){

      grid.innerHTML = html;

    }

    else{

      grid.insertAdjacentHTML(
        "beforeend",
        html
      );

    }



    currentPage++;



  }


  catch(e){

    console.error(
      "Grid loading error:",
      e
    );

  }


  finally{

    loading = false;

  }

}









function createInfiniteObserver(){


  const grid =
  document.getElementById("browseGrid");


  if(!grid) return;



  let trigger =
  document.getElementById("infiniteTrigger");



  if(!trigger){


    trigger =
    document.createElement("div");


    trigger.id =
    "infiniteTrigger";


    trigger.style.height =
    "100px";


    trigger.style.width =
    "100%";



    grid.parentElement.appendChild(trigger);


  }



  if(infiniteObserver){

    infiniteObserver.disconnect();

  }




  infiniteObserver =
  new IntersectionObserver(
    (entries)=>{


      if(
        entries[0].isIntersecting &&
        !loading &&
        currentPage <= totalPages
      ){

        loadGrid();

      }


    },
    {

      rootMargin:"800px"

    }

  );



  infiniteObserver.observe(trigger);


}
