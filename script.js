const text = "Aspiring Data Analyst & AI Enthusiast";
let i = 0;

function typingEffect(){
    const typingElement = document.getElementById("typing");

    if(typingElement && i < text.length){
        typingElement.innerHTML += text.charAt(i);
        i++;
        setTimeout(typingEffect, 80);
    }
}

typingEffect();

function toggleMenu(){
    document.getElementById("nav-links").classList.toggle("active");
}
const counters = document.querySelectorAll('.counter');

counters.forEach(counter => {

    const updateCounter = () => {

        const target = +counter.getAttribute('data-target');
        const current = +counter.innerText;

        const increment = target / 50;

        if(current < target){

            counter.innerText =
            (current + increment).toFixed(1);

            setTimeout(updateCounter, 30);

        }else{

            counter.innerText = target;
        }
    };

    updateCounter();
});