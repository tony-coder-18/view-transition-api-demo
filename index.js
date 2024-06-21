let openMona = document.querySelector("#openCatMona");
let openTomy = document.querySelector("#openCatTomy");
let gallery = document.querySelector(".gallery");
let content = document.querySelector(".content");

function toggleSwiper() {
    console.log(gallery);
    gallery.classList.toggle("slider");
    content.classList.toggle("slider");
    // openMona.remove();
    // document.querySelector(".cat.cat--mona").append(openMona);
};

function toggleSwiperTomy() {
    console.log(gallery);
    gallery.classList.toggle("slider");
    content.classList.toggle("slider");
    document.querySelector(".cat.cat--mona").classList.toggle("cat--last");
};

function makeItSmooth(functionToCall) {
    document.startViewTransition(()=> {
        functionToCall();
    });
};

openMona.addEventListener("click", function () {
    makeItSmooth(toggleSwiper)  
} );

openTomy.addEventListener("click", function () {
    makeItSmooth(toggleSwiperTomy)
} );
