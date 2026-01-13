/*****************
 * BEGIN SCROLL STUFF
 *****************/

const SCROLL_STEP_SIZE = 3;
const SCROLL_TIMEOUT_MINIMUM = 50;
const SCROLL_DELAY_AFTER_USER_ACTION = 500;

let pausedForUserInteraction = false;
let scrollTimeout = 500;
let scrollInterval = null;
let pauseScrollTimeout = null;

const checkboxAutoscroll = document.getElementById("checkbox_autoscroll");
if (checkboxAutoscroll) {
    checkboxAutoscroll.checked = false;
}


/*****************
* Event Handlers
*****************/

checkboxAutoscroll?.addEventListener("click", function () {
    if (this.checked) {
        startScrolling();
    } else {
        stopScrolling();
    }
});

window.addEventListener("wheel", () => {
    pauseScrolling(SCROLL_DELAY_AFTER_USER_ACTION);
});

window.addEventListener("touchmove", () => {
    pauseScrolling(SCROLL_DELAY_AFTER_USER_ACTION);
});

// Handle Page Up/Down keys from bluetooth pedal and Arrow keys for navigation
$(document).on('keydown', function(e) {
    const stickyHeader = document.querySelector('.StickyChords');
    const headerHeight = stickyHeader ? stickyHeader.offsetHeight : 0;
    
    if (e.key === 'PageDown' || e.key === 'PageUp') {
        e.preventDefault();
        
        const currentScroll = window.pageYOffset;
        const viewportHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const maxScroll = documentHeight - viewportHeight;
        
        if (e.key === 'PageDown') {
            const scrollAmount = viewportHeight - headerHeight - 120;
            const targetScroll = Math.min(currentScroll + scrollAmount, maxScroll - headerHeight);
            window.scrollTo(0, Math.max(0, targetScroll));
        } else if (e.key === 'PageUp') {
            const scrollAmount = viewportHeight - headerHeight - 120;
            const targetScroll = Math.max(currentScroll - scrollAmount, 0);
            window.scrollTo(0, targetScroll);
        }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        
        const headers = Array.from(document.querySelectorAll('.chordlyrics-header'));
        if (headers.length === 0) return;
        
        const currentScroll = window.pageYOffset;
        
        let currentHeaderIndex = 0;
        for (let i = 0; i < headers.length; i++) {
            const headerTop = headers[i].offsetTop;
            if (headerTop > currentScroll + 100) {
                currentHeaderIndex = Math.max(0, i - 1);
                break;
            }
            currentHeaderIndex = i;
        }
        
        let targetIndex;
        if (e.key === 'ArrowLeft') {
            targetIndex = Math.max(0, currentHeaderIndex - 1);
        } else {
            targetIndex = Math.min(headers.length - 1, currentHeaderIndex + 1);
        }
        
        const targetHeader = headers[targetIndex];
        const targetTop = targetHeader.offsetTop - headerHeight - 20;
        window.scrollTo({
            top: Math.max(0, targetTop),
            behavior: 'smooth'
        });
    }
});

$('#scroll_speed_down').click(function () {
    // Increase the delay to slow down scroll
    scrollTimeout += 50;
    if (scrollInterval !== null)
    {
        pauseScrolling(SCROLL_DELAY_AFTER_USER_ACTION);
        startScrolling();
    }
});

document.getElementById("scroll_speed_up")?.addEventListener("click", function () {
    // Decrease the delay to speed up scroll.
    // Don't decrease the delay all the way to 0
    scrollTimeout = Math.max(SCROLL_TIMEOUT_MINIMUM, scrollTimeout - 50);

    if (scrollInterval !== null)
    {
        pauseScrolling(SCROLL_DELAY_AFTER_USER_ACTION);
        startScrolling();
    }
});


/*******************
 * Scroll Functions
 ******************/

// Scroll the page by SCROLL_STEP_SIZE
// Will not do anything if `pausedForUserInteraction` is set to `true`
function pageScroll() {
    if (pausedForUserInteraction) { return; }

    const stickyHeader = document.querySelector('.StickyChords');
    const headerHeight = stickyHeader ? stickyHeader.offsetHeight : 0;
    const currentScroll = window.pageYOffset;
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Calculate how much we can scroll before hitting the bottom
    const maxScroll = documentHeight - viewportHeight;
    const targetScroll = Math.min(currentScroll + SCROLL_STEP_SIZE, maxScroll);
    
    // If we're near the bottom, account for header height to ensure content visibility
    const adjustedTargetScroll = Math.min(targetScroll, maxScroll - headerHeight);
    
    window.scrollTo(0, adjustedTargetScroll);
}

// Sets up the `pageScroll` function to be called in a loop every
// `scrollTimeout` milliseconds
function startScrolling() {
    document.getElementById("scroll_speed").innerHTML = (scrollTimeout / 50 - 10) * -1;
    if (scrollInterval) {
        clearInterval(scrollInterval);
    }
    scrollInterval = setInterval(pageScroll, scrollTimeout);
}

// Sets `pausedForUserInteraction` to `true` for `delay` milliseconds. 
// Will stop `pageScroll` from actually scrolling the page
function pauseScrolling(delay) {
    pausedForUserInteraction = true;
    clearTimeout(pauseScrollTimeout);
    pauseScrollTimeout = setTimeout(() => pausedForUserInteraction = false, delay);
}

// Clears the interval that got set up in `startScrolling`
function stopScrolling() {
    clearInterval(scrollInterval);
}


/*****************
 * DONE SCROLL STUFF
 *****************/

function colorize_favs() {
    // make every entry yellow if we faved it before
    const favorites = JSON.parse(localStorage.getItem("favorites")) || {};

    document.querySelectorAll("#results tr").forEach((row) => {
        const tab_url = row.querySelector(".song a")?.getAttribute("href");
        if (tab_url && favorites[tab_url] !== undefined) {
            const favoriteEl = row.querySelector(".favorite");
            if (favoriteEl) {
                favoriteEl.style.color = "#ffae00";
            }
        }
    });
}

function initialise_transpose() {
    let transpose_value = 0;
    const transposedSteps = document.getElementById("transposed_steps");
    const minus = document.getElementById("transpose_down");
    const plus = document.getElementById("transpose_up");

    plus?.addEventListener("click", function () {
        transpose_value = Math.min(11, transpose_value + 1)
        transpose()
    });
    minus?.addEventListener("click", function () {
        transpose_value = Math.max(-11, transpose_value - 1)
        transpose()
    });
    transposedSteps?.addEventListener("click", function () {
        transpose_value = 0
        transpose()
    });

    $('.tab').find('.chord-root, .chord-bass').each(function () {
        const text = $(this).text()
        $(this).attr('data-original', text)
    })

    function transpose() {
        // Hack for safari. Height needs to be auto when reading hidden .tab
        $(".tab").css("height","auto");
        $('.tab').find('.chord-root, .chord-bass').each(function () {
            const originalText = $(this).attr('data-original')
            const transposedSteps = $('#transposed_steps')
            if (transpose_value === 0) {
                $(this).text(originalText);
                if (transposedSteps) {
                    transposedSteps[0].style.display = "none";
                }
            } else {
                const new_text = transpose_note(originalText.trim(), transpose_value);
                $(this).text(new_text);
                if (transposedSteps) {
                    transposedSteps.text((transpose_value > 0 ? "+" : "") + transpose_value);
                    transposedSteps[0].style.display = "";
                }
            }
        });
                updateChords()
    }
            } else {
                const new_text = transpose_note(originalText.trim(), transpose_value);
                updateChords()
    }

    // Defines a list of notes, grouped with any alternate names (like D# and Eb)
    const noteNames = [
        ['A'],
        ['A#', 'Bb'],
        ['B','Cb'],
        ['C', 'B#'],
        ['C#', 'Db'],
        ['D'],
        ['D#', 'Eb'],
        ['E', 'Fb'],
        ['F', 'E#'],
        ['F#', 'Gb'],
        ['G'],
        ['G#', 'Ab'],
    ];

    // Find the given note in noteNames, then step through the list to find the
    // next note up or down. Currently just selects the first note name that
    // matches. It doesn't preserve sharp, flat, or any try to determine what
    // key we're in.
    function transpose_note(note, transpose_value) {
        let noteIndex = noteNames.findIndex(tone => tone.includes(note));
        if (noteIndex === -1)
        {
            console.debug("Note ["+note+"] not found. Can't transpose");
            return note;
        }

        let new_index = (noteIndex + transpose_value) % 12;
        if (new_index < 0) {
            new_index += 12;
        }

        // TODO: Decide on sharp, flat, or natural
        return noteNames[new_index][0];
    }
}

document.addEventListener("DOMContentLoaded", function () {
    colorize_favs();
    initialise_transpose();
});


document.getElementById("checkbox_view_chords")?.addEventListener("click", function () {
    const chordVisuals = document.getElementById("chordVisuals");
    if (chordVisuals) {
        chordVisuals.style.display = this.checked ? "" : "none";
    }
});

document.getElementById("dark_mode")?.addEventListener("click", function () {
    if (document.documentElement.getAttribute('data-bs-theme') == 'dark') {
        document.documentElement.setAttribute('data-bs-theme', 'light');
        localStorage.setItem("dark_mode", false);
    } else {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
        localStorage.setItem("dark_mode", true);
    }
});

document.querySelectorAll(".favorite").forEach((item) => {
    item.addEventListener("click", (event) => {
        const favorites = JSON.parse(localStorage.getItem("favorites")) || {};
        const elm = event.currentTarget;
        const tab_url = elm.getAttribute("data-url");
        if (tab_url in favorites) {
            delete favorites[tab_url];
            elm.style.color = "";
        } else {
            const fav = {
                artist_name: elm.getAttribute("data-artist"),
                song: elm.getAttribute("data-song"),
                type: elm.getAttribute("data-type"),
                rating: elm.getAttribute("data-rating"),
                tab_url: elm.getAttribute("data-url"),
            };
            favorites[fav["tab_url"]] = fav;
            elm.style.color = "#ffae00";
        }
        localStorage.setItem("favorites", JSON.stringify(favorites));
    });
});

const change_columns = (add) => {
    const tabs = document.querySelector(".tab");
    if (tabs) {
        tabs.style.columnCount = parseInt(tabs.style.columnCount || 1) + add;

        const down = document.querySelector("#columns_down");
        const up = document.querySelector("#columns_up");
        if (["", "1"].includes(tabs.style.columnCount)) {
            down.style.opacity = 0.3;
            down.style.pointerEvents = "none";
        } else if (["", "4"].includes(tabs.style.columnCount)) {
            up.style.opacity = 0.3;
            up.style.pointerEvents = "none";
        } else {
            down.style.opacity = 1;
            up.style.opacity = 1;
            down.style.pointerEvents = "auto";
            up.style.pointerEvents = "auto";
        }
    }
};

change_columns(0);
document.querySelector("#columns_up")?.addEventListener("click", () => change_columns(1));
document.querySelector("#columns_down")?.addEventListener("click", () => change_columns(-1));
