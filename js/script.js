"use strict";

const itemContainers = document.querySelectorAll(".item-container");
const orderButton = document.querySelector(".order-button-container > button");
const modalContainer = document.querySelector(".modal-container");
const brlFormat = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function sumArray(array) {
  // Dado um array, retorna a soma de seus elementos
  let sum = 0;
  for (const value of array) sum += value;
  return sum;
}

function convertPrice(priceInCents) {
  // Dado um preço em centavos (int), converter para reais (float)
  return priceInCents / 100;
}

function formatPrice(priceInCents, leadingUnit = true) {
  /* Dado um preço em centavos (int), retorna uma string no 
     formato "R$ XX,XX" se leadingUnit === true, do contrario
     usa o formato "XX,XX" */
  if (leadingUnit === true) return brlFormat.format(convertPrice(priceInCents));
  const formattedPriceArray = brlFormat.formatToParts(
    convertPrice(priceInCents)
  );
  return formattedPriceArray
    .slice(2)
    .map((obj) => obj.value)
    .join("");
}

function getSelectedItem(itemContainer) {
  // Dado um icon-container, retorna o primeiro item selecionado
  return itemContainer.querySelector(".selected");
}

function getAllSelectedItems() {
  // Retorna todos os itens selecionados
  const allSelectedItems = [];
  for (const itemContainer of itemContainers)
    allSelectedItems.push(itemContainer.querySelector(".selected"));
  return allSelectedItems;
}

function getItemName(item) {
  // Dado um item, retorna o nome do item
  return item.querySelector("h3").innerText;
}

function getItemPriceInCents(item) {
  // Dado um item, retorna seu preço em centavos
  const itemPriceFullString = item.querySelector(".item-price").innerText;
  //    ^ Preço com unidade, i.e. "R$ XX,XX"
  const [_, itemPriceString] = itemPriceFullString.split(" ");
  //        ^ Preço sem unidade, i.e. "XX,XX"
  return parseInt(itemPriceString.split(",").join(""));
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

function getOrder() {
  const allSelectedItems = getAllSelectedItems();
  const prices = allSelectedItems.map(getItemPriceInCents);
  const orderSummaryItems =
    modalContainer.querySelectorAll(".summary-item.meal");

  // Adicionando informações dos itens selecionados
  for (let i = 0; i < allSelectedItems.length; i++) {
    const item = allSelectedItems[i];
    const nameSpan = document.createElement("span");
    nameSpan.textContent = getItemName(item);
    orderSummaryItems[i].appendChild(nameSpan);
    const priceSpan = document.createElement("span");
    priceSpan.textContent = formatPrice(prices[i], false);
    orderSummaryItems[i].appendChild(priceSpan);
  }

  // Adicionando total do pedido em order-summary
  const orderSummaryTotal = modalContainer.querySelector(".summary-item.total");
  const totalPrice = formatPrice(sumArray(prices));
  const totalSpan = document.createElement("span");
  totalSpan.textContent = totalPrice;
  orderSummaryTotal.appendChild(totalSpan);

  // Exibindo modal
  modalContainer.classList.remove("hidden");
}

window.onload = () => {
  const items = document.querySelectorAll(".item");
  items.forEach((item) => {
    item.addEventListener("click", selectItem);
  });
};
