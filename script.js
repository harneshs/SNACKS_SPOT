const API_URL =
    "https://script.google.com/macros/s/YOUR_DEPLOYED_WEBAPP_URL/exec";

let menu = [];
let cart = [];
let settings = {};

window.onload = async () => {
    await loadSettings();
    await loadMenu();
};

async function loadSettings() {

    const response = await fetch(
        API_URL + "?action=getSettings"
    );

    const data = await response.json();

    settings = data.settings;

}

async function loadMenu() {

    const response = await fetch(
        API_URL + "?action=getMenu"
    );

    const data = await response.json();

    menu = data.menu;

    renderMenu();

}

function renderMenu() {

    const container =
        document.getElementById("menuContainer");

    container.innerHTML = "";

    menu.forEach(item => {

        const card = document.createElement("div");

        card.className = "menu-card";

        card.innerHTML = `
    <h3>${item.name}</h3>
    <p>₹${item.price}</p>
    <button onclick="addToCart('${item.name}', ${item.price})">
        Add
    </button>
`;

        container.appendChild(card);
    });

}

function addToCart(name, price) {

    const existing = cart.find(
        item => item.name === name
    );

    if (existing) {
        existing.qty++;
    } else {

        cart.push({
            name,
            price,
            qty: 1
        });
    }

    renderCart();

}

function renderCart() {

    const cartDiv =
        document.getElementById("cartItems");

    cartDiv.innerHTML = "";

    let total = 0;

    cart.forEach(item => {

        total += item.price * item.qty;

        const div =
            document.createElement("div");

        div.className = "cart-item";

        div.innerHTML = `
        <span>
            ${item.name}
            x ${item.qty}
        </span>

        <span>
            ₹${item.price * item.qty}
        </span>
    `;

        cartDiv.appendChild(div);
    });

    document.getElementById(
        "totalAmount"
    ).innerText = total;

}

function clearCart() {

    cart = [];

    renderCart();

}

function showQR() {

    const total =
        document.getElementById(
            "totalAmount"
        ).innerText;

    const upi =
        settings.UPI_ID || "snacksspot@upi";

    const upiUrl =
        `upi://pay?pa=${upi}&pn=SNACKS SPOT&am=${total}`;

    const qrUrl =
        "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data="
        + encodeURIComponent(upiUrl);

    document.getElementById(
        "qrImage"
    ).src = qrUrl;

    document.getElementById(
        "qrModal"
    ).style.display = "block";

}

function closeQR() {

    document.getElementById(
        "qrModal"
    ).style.display = "none";

}

async function placeOrder() {

    if (cart.length === 0) {

        alert("Cart is empty");

        return;
    }

    const total =
        Number(
            document.getElementById(
                "totalAmount"
            ).innerText
        );

    const payload = {
        action: "saveOrder",
        items: cart,
        total: total
    };

    const response = await fetch(
        API_URL,
        {
            method: "POST",
            body: JSON.stringify(payload)
        }
    );

    const result =
        await response.json();

    if (result.success) {

        alert(
            "Order Saved\n" +
            result.orderId
        );

        clearCart();

    } else {

        alert(
            "Failed to save order"
        );
    }

}

function printBill() {

    let bill = "";

    bill += "<h2>SNACKS SPOT</h2>";
    bill += "<hr>";

    let total = 0;

    cart.forEach(item => {

        const amount =
            item.price * item.qty;

        total += amount;

        bill += `
            <p>
            ${item.name}
            x ${item.qty}
            = ₹${amount}
            </p>
        `;
    });

    bill += "<hr>";
    bill += `<h3>Total : ₹${total}</h3>`;

    const win =
        window.open("", "", "width=300,height=600");

    win.document.write(bill);

    win.document.close();

    win.print();
}