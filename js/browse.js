let browseType = "movie";
let browseGenre = null;

let currentPage = 1;
let totalPages = 1;
let loading = false;

let infiniteObserver = null;
let infiniteTrigger = null;


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

  CV.initTopSearch();

  const ready = await CV.checkApiKey();

  const grid = document.getElementById("browseGrid");

  if (!ready) {

    if (grid) {
      grid.innerHTML = CV.configNoticeHTML();
    }

    return;
  }


  /* -----------------------------------------
     MOVIE / TV TYPE CHIPS
     ----------------------------------------- */

  document
    .querySelectorAll("#browseTypeChips .chip")
    .forEach((chip) => {

      chip.addEventListener("click", async () => {

        const newType = chip.dataset.type;

        if (!newType || newType === browseType) {
          return;
        }

        browseType = newType;

        browseGenre = null;


        document
          .querySelectorAll("#browseTypeChips .chip")
          .forEach((c) => {
            c.classList.remove("active");
          });


        chip.classList.add("active");


        await loadGenres();

      });

    });


  await loadGenres();

});


/* =========================================================
   LOAD GENRES
   ========================================================= */

async function loadGenres() {

  const chipRow =
    document.getElementById("browseGenreChips");

  if (!chipRow) return;


  chipRow.innerHTML = `
    <div class="section-note" style="padding:0;">
      loading genres…
    </div>
  `;


  try {

    const data =
      await CV.tmdb(`/genre/${browseType}/list`);


    if (!data || !Array.isArray(data.genres)) {
      throw new Error("Invalid genre response");
    }


    /*
     * Don't assume the first genre exists.
     * "All" is represented by null.
     */

    browseGenre = null;


    chipRow.innerHTML = `
      <button
        class="chip active"
        data-genre=""
      >
        All
      </button>

      ${data.genres.map((g) => `
        <button
          class="chip"
          data-genre="${g.id}"
        >
          ${escapeHTML(g.name)}
        </button>
      `).join("")}
    `;


    chipRow
      .querySelectorAll(".chip")
      .forEach((chip) => {

        chip.addEventListener("click", async () => {

          const value =
            chip.dataset.genre;


          browseGenre =
            value === ""
              ? null
              : Number(value);


          chipRow
            .querySelectorAll(".chip")
            .forEach((c) => {
              c.classList.remove("active");
            });


          chip.classList.add("active");


          resetGrid();

          await loadGrid();

        });

      });


    /*
     * Initial load
     */

    resetGrid();

    await loadGrid();

  }

  catch (error) {

    console.error(
      "Genre loading error:",
      error
    );


    chipRow.innerHTML = "";


    const grid =
      document.getElementById("browseGrid");


    if (grid) {

      grid.innerHTML =
        CV.emptyStateHTML(
          "Couldn't load genres",
          "Check your connection or TMDB key."
        );

    }

  }

}


/* =========================================================
   RESET BROWSE
   ========================================================= */

function resetGrid() {

  const grid =
    document.getElementById("browseGrid");

  if (!grid) return;


  /*
   * Stop the old observer before resetting anything.
   */

  if (infiniteObserver) {

    infiniteObserver.disconnect();

    infiniteObserver = null;

  }


  /*
   * Reset pagination completely.
   */

  currentPage = 1;
  totalPages = 1;
  loading = false;


  /*
   * Remove the old trigger.
   */

  if (infiniteTrigger) {

    infiniteTrigger.remove();

    infiniteTrigger = null;

  }


  const oldTrigger =
    document.getElementById("infiniteTrigger");

  if (oldTrigger) {
    oldTrigger.remove();
  }


  /*
   * Show loading skeletons.
   */

  grid.innerHTML =
    CV.skeletonHTML(18);


  /*
   * Create a fresh trigger after the grid.
   */

  createInfiniteObserver();

}


/* =========================================================
   LOAD GRID
   ========================================================= */

async function loadGrid() {

  const grid =
    document.getElementById("browseGrid");

  if (!grid) return;


  /*
   * Never allow two page requests at once.
   */

  if (loading) {
    return;
  }


  /*
   * We've reached the end.
   */

  if (currentPage > totalPages) {

    hideInfiniteTrigger();

    return;

  }


  loading = true;

  showInfiniteTrigger();


  const pageBeingLoaded =
    currentPage;


  try {

    const params = {
      page: pageBeingLoaded,
      sort_by: "popularity.desc"
    };


    /*
     * Only send with_genres when a genre
     * has actually been selected.
     */

    if (browseGenre !== null) {

      params.with_genres =
        browseGenre;

    }


    const data =
      await CV.tmdb(
        `/discover/${browseType}`,
        params
      );


    if (!data || !Array.isArray(data.results)) {

      throw new Error(
        "Invalid TMDB discover response"
      );

    }


    /*
     * Update total pages immediately.
     */

    totalPages =
      Number(data.total_pages) || 1;


    const html =
      data.results
        .map((item) => CV.cardHTML(item))
        .join("");


    /*
     * Page 1 replaces the skeleton.
     * Every later page appends.
     */

    if (pageBeingLoaded === 1) {

      grid.innerHTML =
        html || `
          ${CV.emptyStateHTML(
            "Nothing found",
            "There aren't any results for this filter."
          )}
        `;

    }

    else if (html) {

      grid.insertAdjacentHTML(
        "beforeend",
        html
      );

    }


    /*
     * Only advance the page after a
     * successful request.
     */

    currentPage =
      pageBeingLoaded + 1;


    /*
     * Hide the spinner when there are
     * no more pages.
     */

    if (
      currentPage > totalPages ||
      data.results.length === 0
    ) {

      hideInfiniteTrigger();

    }


    /*
     * If the first page isn't tall enough
     * to reach the observer, immediately
     * request another page.
     */

    requestAnimationFrame(() => {

      if (
        !loading &&
        currentPage <= totalPages &&
        infiniteTrigger
      ) {

        const rect =
          infiniteTrigger.getBoundingClientRect();


        if (rect.top <= window.innerHeight + 800) {

          loadGrid();

        }

      }

    });

  }

  catch (error) {

    console.error(
      "Browse grid loading error:",
      error
    );


    /*
     * Don't advance currentPage on failure.
     * This allows the same page to retry.
     */

    if (pageBeingLoaded === 1) {

      grid.innerHTML =
        CV.emptyStateHTML(
          "Couldn't load movies",
          "Check your connection and try again."
        );

    }

  }

  finally {

    loading = false;

  }

}


/* =========================================================
   INFINITE SCROLL TRIGGER
   ========================================================= */

function createInfiniteObserver() {

  const grid =
    document.getElementById("browseGrid");

  if (!grid) return;


  /*
   * Remove any old trigger.
   */

  if (infiniteTrigger) {

    infiniteTrigger.remove();

  }


  /*
   * Create the trigger OUTSIDE the grid.
   *
   * This is important because the grid is a
   * CSS grid. Putting the observer inside it
   * can interfere with the grid layout.
   */

  infiniteTrigger =
    document.createElement("div");


  infiniteTrigger.id =
    "infiniteTrigger";


  grid.insertAdjacentElement(
    "afterend",
    infiniteTrigger
  );


  /*
   * Disconnect previous observer.
   */

  if (infiniteObserver) {

    infiniteObserver.disconnect();

  }


  /*
   * Create a new observer.
   */

  infiniteObserver =
    new IntersectionObserver(
      (entries) => {

        const entry =
          entries[0];

        if (!entry || !entry.isIntersecting) {
          return;
        }


        if (loading) {
          return;
        }


        if (currentPage > totalPages) {

          hideInfiniteTrigger();

          return;

        }


        loadGrid();

      },
      {
        root: null,

        /*
         * Start loading well before the
         * user actually reaches the bottom.
         */

        rootMargin:
          "1000px 0px 1000px 0px",

        threshold: 0
      }
    );


  infiniteObserver.observe(
    infiniteTrigger
  );

}


/* =========================================================
   TRIGGER HELPERS
   ========================================================= */

function showInfiniteTrigger() {

  if (!infiniteTrigger) return;

  infiniteTrigger.style.display =
    "flex";

}


function hideInfiniteTrigger() {

  if (!infiniteTrigger) return;

  infiniteTrigger.style.display =
    "none";

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}
