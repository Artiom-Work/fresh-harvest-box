'use strict';
// initialization iziModal windows
$('#popup-thanks').iziModal({
	bodyOverflow: true,
	background: false
});
$('#popup-user-order').iziModal({
	background: false,
	bodyOverflow: true,
	width: ''
});
// Global variables
const mediaQueryMobile = window.matchMedia('(max-width: 767px)');

const menuSwitcher = document.getElementById('menu-switch');
const mobileMenu = document.querySelector('.mobile-menu__wrapper');
const linkToMobileMenu = document.querySelector('.link-to-mobile-menu');

const productsBox = document.querySelector('.products__list');

const cardNumberField = document.getElementById('cc-number');

const cartList = document.querySelector('.cart-list');
const basketCounter = document.querySelector('.basket__counter');
const basketCounterMobile = document.querySelector('.basket__counter--mobile');

let cartItems = loadCartFromLocalStorage();
// ================================================================================================
// For mobile menu
menuSwitcher.addEventListener('change', (e) => {
	if (e.target.checked) {
		bodyLock();
		menuSwitcher.labels[0].title = 'close';
	} else if (!e.target.checked) {
		bodyUnlock();
		menuSwitcher.labels[0].title = 'mobile menu';
	}
});
linkToMobileMenu.addEventListener('click', (e) => {
	if (mediaQueryMobile.matches) {
		menuSwitcher.checked = true;
		bodyLock();
	}
});
mobileMenu.addEventListener('click', (e) => {
	menuSwitcher.checked = false;
	bodyUnlock();
});

function bodyLock() {
	const lockPaddingValue = window.innerWidth - document.querySelector('body').offsetWidth + "px";
	document.body.style.paddingRight = lockPaddingValue;
	document.body.classList.add('lock-body');
}
function bodyUnlock() {
	document.body.style.paddingRight = '0px';
	document.body.classList.remove('lock-body');
}
// ================================================================================================

// For section products
// Function for generating a list of products on a page based on a  json data file
async function loadProducts() {
	let productsData;
	try {
		const response = await fetch('./data/products.json');
		productsData = await response.json();
	} catch (error) {
		console.error('Error:', error);
	}
	productsData.forEach(({ imagePath, retinaImagePath, name, type, price, cardColor, id }) => {
		const productCard = `
					<li class="products__item" data-product-id="${id}" data-product-color="${cardColor}">
						<article class="product-card" style="background-color:${cardColor}">
							<h3 class="product-card__name">${name}</h3>
							<span class="product-card__type">${type}</span>
							<div class="product-card__image-wrapper">
								<img class="product-card__image" src="${imagePath}" srcset="${retinaImagePath} 2x" alt="${name}" width="295"
									height="251" loading="lazy">
							</div>
	
							<div class="product-card__price button">
								${price}&nbsp;UAH&nbsp;/ kg
							</div>
						</article>
					</li>
		`;
		productsBox.insertAdjacentHTML('beforeend', productCard);
	});
}
// Function for processing data after clicking on a product
productsBox.addEventListener('click', (e) => {
	const productItem = e.target.closest('.products__item');
	if (productItem) {
		const productData = getProductData(productItem);
		cartItems.push(productData);
		saveCartToLocalStorage(cartItems);
		updateCartDisplay();
		alert("The product has been added to your cart.");
	}
});
loadProducts();
// ================================================================================================
// Added mask of user card imput in user card form
cardNumberField.addEventListener('input', function () {
	const value = this.value.replace(/\D/g, '');
	const formattedValue = formatCardNumber(value);
	this.value = formattedValue;
});

function formatCardNumber(value) {
	const parts = [];
	for (let i = 0; i < value.length; i += 4) {
		parts.push(value.slice(i, i + 4));
	}
	return parts.join(' ').trim();
}
// ================================================================================================

// For modal windows (iziModal library settings) 

// opening modal windows
$('#quick-order-form').on('submit', function (e) {
	e.preventDefault();
	// Standard validation with standard message output
	if (!this.checkValidity()) {
		this.reportValidity();
		return;
	}

	// If there is a server to send data
	// fetch('/your-server-url', {
	// 	method: 'POST',
	// 	body: new FormData(document.getElementById('quick-order-form'))
	// })
	// 	.then((response) => response.json())
	// 	.then((data) => {
	// 		$('#popup-thanks').iziModal('open');
	// 	})
	// 	.catch((error) => console.error('Error:', error));
	$('#popup-thanks').iziModal('open');
	// Simulate sending data (page refresh)
	$('#popup-thanks').on('closed', function () {
		location.reload();
	});
});
// All buttons that have the class "open-popup-user-order"
$('.open-popup-user-order').click(function (e) {
	$('#popup-user-order').iziModal('open');
});
// Form settings in modal window
$('#user-order-form').on('submit', function (e) {
	let orderString = "You ordered:\n";

	e.preventDefault();
	// Standard validation with standard message output
	if (!this.checkValidity()) {
		this.reportValidity();
		return;
	}
	if (cartItems.length === 0) {
		alert('Cart is empty! Please add items to checkout..');
		return; // Stop submit if it's empty
	}
	// To simulate sending data to the server and displaying the order list to the user
	const checkboxes = document.querySelectorAll('input[name="products[]"]:checked');
	const selectedCartItems = [];
	checkboxes.forEach(checkbox => {
		const productId = checkbox.value;
		const selectedItem = cartItems.find(item => String(item.id) === productId);
		if (selectedItem) {
			selectedCartItems.push(selectedItem);
		}
	});
	selectedCartItems.forEach(item => {
		orderString += "- " + item.name + "\n";// Add a product name and a newline
	});
	alert(orderString);
	localStorage.removeItem('cart');
	cartItems = [];
	updateCartDisplay();
	// If there is a server to send data
	// fetch('/your-server-url', {
	// 	method: 'POST',
	// 	body: new FormData(document.getElementById('user-order-form'))
	// })
	// 	.then((response) => response.json())
	// 	.then((data) => {
	// 		$('#popup-thanks').iziModal('open');
	// 	})
	// 	.catch((error) => console.error('Error:', error));
	$('#popup-user-order').iziModal('close');
	$('#popup-user-order').on('closed', function () {
		$('#popup-thanks').iziModal('open');
	});
	bodyLock();
	// Simulate sending data (page refresh)
	$('#popup-thanks').on('closed', function () {
		location.reload();
	});
});
// ================================================================================================
// For user's products basket
document.addEventListener('DOMContentLoaded', function () {
	updateCartDisplay();
	loadSpecialProducts();
});
// Function for generating default products of the user's shopping cart based on an additional  json data file 
async function loadSpecialProducts() {
	let specialProductsData;
	if (localStorage.getItem('cart') === null || localStorage.getItem('cart') === '[]') {
		try {
			const response = await fetch('./data/special-offer.json');
			specialProductsData = await response.json();
		} catch (error) {
			console.error('Error:', error);
			return;
		}
		specialProductsData.forEach(product => {
			cartItems.push(product);
		});
		saveCartToLocalStorage(cartItems);
	}
	updateCartDisplay();
}

// Product data collection function ( When a user clicks on a product )
function getProductData(productItem) {
	const productName = productItem.querySelector('.product-card__name').textContent;
	const productType = productItem.querySelector('.product-card__type').textContent;
	const productImage = productItem.querySelector('.product-card__image').src;
	const productImageRetina = productItem.querySelector('.product-card__image').getAttribute('srcset');
	const productId = productItem.dataset.productId;
	console.log(productImageRetina);
	const productColorCard = productItem.dataset.productColor;

	return {
		id: productId,
		name: productName,
		type: productType,
		image: productImage,
		retina: productImageRetina,
		cardColor: productColorCard
	};
}

// Function for saving an array of product data in localStorage
function saveCartToLocalStorage(cartItems) {
	localStorage.setItem('cart', JSON.stringify(cartItems));
}
//  Function for data unloading from localStorage
function loadCartFromLocalStorage() {
	const cartData = localStorage.getItem('cart');
	try {
		return cartData ? JSON.parse(cartData) : [];
	} catch (error) {
		console.error("Error parsing JSON from localStorage:", error);
		return [];
	}
}

// The functions of updating and filling the user's shopping cart
function createCartItemHTML(product) {
	return `
    <li class="cart-list__item user-purchase" style="background-color:${product.cardColor}" data-product-id="${product.id}">
      <label class="visually-hidden" for="product1">Product ${product.name}</label>
      <input class="user-purchase__choice" type="checkbox" id="product-${product.id}" name="products[]" value="${product.id}" form="user-order-form" checked>
      <h4 class="visually-hidden">User's procuct description</h4>
      <div class="user-purchase__header">
        <h5 class="user-purchase__name">${product.name}</h5>
        <span class="user-purchase__type">${product.type}</span>
      </div>
      <img class="user-purchase__image" src="${product.image}" srcset="${product.retina} 2x" alt="${product.name}" width="229" height="196">
    </li>
  `;
}

function updateCartDisplay() {
	const cartData = localStorage.getItem('cart');
	if (!cartData) {
		return;
	}

	cartList.innerHTML = '';
	cartItems.forEach(product => {
		cartList.insertAdjacentHTML('beforeend', createCartItemHTML(product));
	});

	basketCounter.textContent = cartItems.length;
	basketCounterMobile.textContent = cartItems.length;
}
// function remove products from user cart
cartList.addEventListener('click', (e) => {
	const productItem = e.target.closest('.cart-list__item');
	const isCheckbox = e.target.matches('input[type="checkbox"]');

	if (productItem && !isCheckbox) {
		const productID = productItem.dataset.productId;
		const confirmation = confirm("Are you sure you want to remove this item from your cart?");
		if (confirmation) {
			const indexToRemove = cartItems.findIndex(item => String(item.id) === productID);
			// Remove the product from the array
			if (indexToRemove !== -1) {
				cartItems.splice(indexToRemove, 1);
				saveCartToLocalStorage(cartItems);
				updateCartDisplay();
			}
		}
	}
});