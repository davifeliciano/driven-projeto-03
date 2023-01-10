"use strict";

// Telefone do restaurante
const phoneNumber = "5561999999999";
const itemContainers = document.querySelectorAll(".item-container");
const orderButton = document.querySelector(".order-button-container > button");
const modalContainer = document.querySelector(".modal-container");
const userFormModal = modalContainer.querySelector("#user-form-modal");
const orderModal = modalContainer.querySelector("#order-modal");
const fullnameInput = document.querySelector("#fullname");
const addressInput = document.querySelector("#address");
const formHint = document.querySelector(".input-container .form-hint");
const brlFormat = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function sumArray(array) {
  // Dado um array, retorna a soma de seus elementos
  let sum = 0;
  for (const value of array) {
    sum += value;
  }
  return sum;
}

function convertPrice(priceInCents) {
  // Dado um preço em centavos (int), converter para reais (float)
  const centsInADollar = 100;
  return priceInCents / centsInADollar;
}

function formatPrice(priceInCents, leadingUnit = true) {
  /* Dado um preço em centavos (int), retorna uma string no
     formato "R$ XX,XX" se leadingUnit === true, do contrario
     usa o formato "XX,XX" */
  if (leadingUnit === true) {
    return brlFormat.format(convertPrice(priceInCents));
  }

  // Array no formato ["R$", " ", "XX", ",", "XX"]
  const formattedPriceArray = brlFormat.formatToParts(
    convertPrice(priceInCents)
  );

  const priceStartPosition = 2;
  return formattedPriceArray
    .slice(priceStartPosition) // Dipensa ["R$", " "]
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
  for (const itemContainer of itemContainers) {
    allSelectedItems.push(itemContainer.querySelector(".selected"));
  }

  return allSelectedItems;
}

function getItemName(item) {
  // Dado um item, retorna o nome do item
  return item.querySelector(".item-name").innerText;
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
  /* Função chamada ao clicar em qualquer card */
  if (this.classList.contains("selected")) {
    return;
  }

  // Remova a classe de todos os irmãos
  for (const sibling of this.parentElement.children) {
    sibling.classList.remove("selected");
  }

  // Adiciona a classe selected ao elemento clicado
  this.classList.add("selected");
  /* Checa se as 3 categorias tem itens selecionados
     Nesse caso, ative o botão de pedido */
  for (const itemContainer of itemContainers) {
    if (getSelectedItem(itemContainer) === null) {
      return;
    }
  }

  orderButton.innerText = "Fechar Pedido";
  orderButton.removeAttribute("disabled");
}

function getUserInfo() {
  /* Retorna um objeto com fullname e address do usuário
     se houver. Do contário, retorna null */
  const fullname = fullnameInput.value.trim();
  const address = addressInput.value.trim();
  for (const value of [fullname, address]) {
    if (value === "") {
      return null;
    }
  }
  return { fullname: fullname, address: address };
}

function showModalContainer() {
  if (!modalContainer.classList.contains("hidden")) {
    return;
  }

  modalContainer.classList.remove("hidden");
  const keyframes = { backgroundColor: "rgba(255, 255, 255, 0.9)" };
  const options = {
    duration: 500,
    easing: "ease",
    fill: "forwards",
  };
  modalContainer.animate(keyframes, options);
}

function hideModalContainer() {
  const keyframes = { backgroundColor: "rgba(255, 255, 255, 0.0)" };
  const options = {
    duration: 500,
    easing: "ease",
    fill: "forwards",
  };
  modalContainer.animate(keyframes, options).addEventListener("finish", () => {
    modalContainer.classList.add("hidden");
  });
}

function showModal(modal) {
  // Centraliza o elemento modal na tela com uma animação
  const keyframes = {
    top: "50%",
    right: 0,
    transform: "translate(50%, -50%)",
  };
  const options = {
    duration: 500,
    easing: "ease-in",
    direction: "reverse",
  };
  modal.classList.remove("hidden");
  modal.animate(keyframes, options);
}

function hideModal(hideContainer = false) {
  /* Esconde o modal em exibição, se houver. Caso se o modal
     corresponder a #order-modal limpa o model após o fim da animação
     Se hideContainer === true, esconde o container */
  const modal = modalContainer.querySelector(".modal:not(.hidden)");
  if (modal === null) {
    return;
  }

  const keyframes = {
    top: "50%",
    left: 0,
    transform: "translate(-100%, -50%)",
  };
  const options = {
    duration: 500,
    easing: "ease",
  };
  modal.animate(keyframes, options).addEventListener("finish", () => {
    modal.classList.add("hidden");
    if (modal.id === "order-modal") {
      clearOrderModal();
    }
    if (hideContainer === true) {
      hideModalContainer();
    }
  });
}

function showUserFormModal() {
  /* Função chamada com um clique no botão de Fechar Pedido
     situado no footer */
  showModalContainer();
  showModal(userFormModal);
  fullnameInput.focus();
}

function showOrderModal() {
  /* Função chamada com um clique no botão de Fechar Pedido
     no modal #user-info-modal */
  // Checa se os campos de nome e endereço não estão em branco
  if (getUserInfo() === null) {
    formHint.classList.remove("hidden");
    return;
  }

  hideModal();
  const allSelectedItems = getAllSelectedItems();
  const prices = allSelectedItems.map(getItemPriceInCents);
  const orderItems = orderModal.querySelectorAll(".summary-item.meal");

  // Adicionando informações dos itens selecionados
  for (let i = 0; i < allSelectedItems.length; i++) {
    const item = allSelectedItems[i];
    const nameSpan = document.createElement("span");
    nameSpan.innerText = getItemName(item);
    orderItems[i].appendChild(nameSpan);
    const priceSpan = document.createElement("span");
    priceSpan.innerText = formatPrice(prices[i], false);
    orderItems[i].appendChild(priceSpan);
  }

  // Adicionando total do pedido em order-summary
  const orderTotal = orderModal.querySelector(".summary-item.total");
  const totalPrice = formatPrice(sumArray(prices));
  const totalSpan = document.createElement("span");
  totalSpan.innerText = totalPrice;
  orderTotal.appendChild(totalSpan);

  // Exibindo modal com o resumo do pedido
  showModal(orderModal);
}

function getWhatsAppUrl(fullname, address) {
  /* Retorna uma URL para uma conversa com o restaurante
     com a mensagem contendo as informações sobre o pedido
     e os dados do usuário */
  const items = getAllSelectedItems();
  if (items === null) {
    return null;
  }

  const prices = items.map(getItemPriceInCents);
  const totalPrice = formatPrice(sumArray(prices));
  const message = encodeURI(`Olá, gostaria de fazer o pedido:
- Prato: ${getItemName(items[0])}
- Bebida: ${getItemName(items[1])}
- Sobremesa: ${getItemName(items[2])}
Total: ${totalPrice}

Nome: ${fullname}
Endereço: ${address}`);

  return `https://wa.me/${phoneNumber}?text=${message}`;
}

function redirectUser() {
  /* Redireciona o usuário para uma conversa com o restaurante
     contendo uma mensagem pré carregada com o pedido */
  const userInfo = getUserInfo();
  const whatsAppUrl = getWhatsAppUrl(userInfo.fullname, userInfo.address);
  window.location.replace(whatsAppUrl);
}

function clearOrderModal() {
  // Limpa as informações do modal com o resumo do pedido
  const modalItems = document.querySelectorAll(".summary-item");
  for (const modalItem of modalItems) {
    if (modalItem.classList.contains("meal")) {
      modalItem.innerHTML = "";
    }
    if (modalItem.classList.contains("total")) {
      modalItem.removeChild(modalItem.lastChild);
    }
  }
}

window.onload = () => {
  // Chame selectItem quando um card é clicado
  const items = document.querySelectorAll(".item");
  items.forEach((item) => {
    item.addEventListener("click", selectItem);
  });

  /* Coloque o foco no input #address ao pressionar
     Enter quando o input #fullname estiver em foco */
  fullnameInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      addressInput.focus();
    }
  });

  /* Chame showOrderModal ao pressionar Enter
     quando o input #address estiver em foco */
  addressInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      showOrderModal();
    }
  });

  /* Esconda todos os modals ao pressionar qualquer
     botão de Cancelar */
  const cancelButtons = document.querySelectorAll(".cancel-btn");
  for (const cancelButton of cancelButtons) {
    cancelButton.addEventListener("click", (event) => {
      hideModal(true);
    });
  }

  /* Esconda todos os modais e mostre o modal dos dados
     do usuário ao clicar no botão de voltar */
  const backButton = document.querySelector(".back-btn");
  backButton.addEventListener("click", (event) => {
    hideModal();
    showUserFormModal();
  });
};
