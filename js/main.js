'use strict';
const mediaQueryMobile = window.matchMedia('(max-width: 767px)');
//lock body after the mobile menu appeared
const menuSwitcher = document.getElementById('menu-switch');
const mobileMenu = document.querySelector('.mobile-menu__wrapper');
const linkToMobileMenu = document.querySelector('.link-to-mobile-menu');
const main = document.querySelector('main');
const footer = document.querySelector('footer');

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
	if (main && footer) {
		main.classList.add('hide-layer');
		footer.classList.add('hide-layer');
	}
}
function bodyUnlock() {
	document.body.style.paddingRight = '0px';
	document.body.classList.remove('lock-body');
	if (main && footer) {
		function visibleLayer() {
			main.classList.remove('hide-layer');
			footer.classList.remove('hide-layer');
		}

		setTimeout(visibleLayer, 200);
	}
}

// for section products
const productsBox = document.querySelector('.products__list');

async function loadProducts() {
	let productsData;
	try {
		const response = await fetch('./data/products.json');
		productsData = await response.json();
	} catch (error) {
		console.error('Ошибка:', error);
	}
	productsData.forEach(({ imagePath, name, type, price, cardColor }) => {
		const productCard = `
					<li class="products__item">
						<article class="product-card" style="background-color:${cardColor}">
							<h3 class="product-card__name">${name}</h3>
							<span class="product-card__type">${type}</span>
							<div class="product-card__image-wrapper">
								<img class="product-card__image" src="${imagePath}" alt="${name}" width="295"
									height="251">
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
loadProducts();

// iziModal settings

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
// For user card form
const cardNumberField = document.getElementById('cc-number');
// added mask of user card imput
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
// opening modal windows
$('.open-popup-thanks').click(function (e) {
	e.preventDefault();
	const emailInput = document.getElementById('quick-order-useremail');

	if (!emailInput.validity.valid) {
		emailInput.reportValidity();
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

$('.open-popup-user-order').click(function (e) {
	$('#popup-user-order').iziModal('open');
});

$('#user-order-form').on('submit', function (e) {
	e.preventDefault();
	if (!this.checkValidity()) {
		this.reportValidity();
		return;
	}
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


