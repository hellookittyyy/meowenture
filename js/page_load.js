function main() {
  includeComponents();
}

window.addEventListener("load", main);

async function includeComponents() {
  document.querySelector("#header").innerHTML = await fetch(
    "./components/header.html"
  )
    .then((response) => response.text())
    .then((html) => {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      return tempDiv.innerHTML;
    });
}