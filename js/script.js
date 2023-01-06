"use strict";

const itemContainers = document.querySelectorAll(".item-container");
const orderButton = document.querySelector(".order-button-container > button");

function getSelectedItem(itemContainer) {
  return itemContainer.querySelector(".selected");
}

function selectItem() {
  if (this.classList.contains("selected")) return;
  // Remova a classe de todos os irmãos
  for (const sibling of this.parentElement.children)
    sibling.classList.remove("selected");
  // Adiciona a classe selected ao elemento clicado
  this.classList.add("selected");
  // Checa se as 3 categorias tem itens selecionados
  // Nesse caso, ative o botão de pedido
  for (const itemContainer of itemContainers)
    if (getSelectedItem(itemContainer) === null) return;
  orderButton.removeAttribute("disabled");
}

window.onload = () => {
  const items = document.querySelectorAll(".item");
  items.forEach((item) => {
    item.addEventListener("click", selectItem);
  });
};
