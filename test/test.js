Pt=(o,e=-20,t=20)=>Math.min(Math.max(o,e),t);
var MvAuto = true;

var CurrentTime = 0;
function initCard()
{
  var cards = document.querySelectorAll(".acard");
  cards.forEach(function(card) {
    card.style.setProperty('--ry', '0deg');
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--tx', '0px');
    card.style.setProperty('--ty', '0px');
    card.style.setProperty('--mx', '50%');
    card.style.setProperty('--my', '50%');
    card.style.setProperty('--pos', '50% 50%');
    card.style.setProperty('--posx', '50%');
    card.style.setProperty('--posy', '50%');
    card.style.setProperty('--hyp', '0.5');
    card.style.setProperty('--o', '0.8');
  });
  CurrentTime = 0;
}

function animateShine()
{
  if (MvAuto)
  {
    CurrentTime += 0.05; // Increment time for smooth animation
    var pos = (Math.sin(CurrentTime) + 1) * 50; // Map sine (-1 to 1) to 0% to 100%
    var cards = document.querySelectorAll(".acard");  
    cards.forEach(function(card) {
      card.style.setProperty('--mx', pos + '%');
      card.style.setProperty('--my', '50%'); // Keep Y centered
      card.style.setProperty('--pos', '50% ' + pos + '%');
      card.style.setProperty('--posx', pos + '%');
      card.style.setProperty('--posy', '50%');
      card.style.setProperty('--hyp', Pt(pos / 50, 0, 1)); // Adjust brightness based on position
      card.style.setProperty('--o', '0.8'); // Ensure opacity is consistent
    });
    requestAnimationFrame(animateShine); // Use requestAnimationFrame for smoother animation
  }
}

document.addEventListener("DOMContentLoaded", (event) => {
  initCard();
  animateShine();
});