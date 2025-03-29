// Utility to get element by ID
function $(id) {
  return document.getElementById(id);
}
Storage.prototype.setObject = function(key, value) {
  this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
  var value = this.getItem(key);
  console.log(value);
  console.log(JSON.parse(value));
  return JSON.parse(value);
}
// Capitalize country tags (e.g., ["en:canada"] -> "Canada")
function capitalizeCountries(input) {
  if (!input) return "";
  if (Array.isArray(input)) {
    return input
      .map(c => c.replace(/^[a-z]+:/i, "").trim())
      .map(c => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase())
      .join(", ");
  }
  // if input is a string of comma-separated countries
  return input
    .split(",")
    .map(c => c.replace(/^[a-z]+:/i, "").trim())
    .map(c => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase())
    .join(", ");
}

// Some informative facts for certain categories (used in details view)
const categoryFacts = {
  dairy: "Canadian dairy farmers adhere to high standards and support thousands of local farms.",
  beverage: "Many Canadian beverage companies are independently owned. Choosing them supports local businesses and jobs.",
  default: "Choosing Canadian alternatives helps support local communities and reduce environmental impact."
};

// Highlight the selected card visually, unhighlight others
function highlightSelectedCard(cardElement) {
  const prevSelected = document.querySelector(".card.selected");
  if (prevSelected) prevSelected.classList.remove("selected");
  cardElement.classList.add("selected");
}

// Display details of a selected Canadian alternative
function displayAlternativeDetails(altData, productCategory) {
  // Set alternative name
  $("alternativeName").textContent = altData.name;
  // Show location (or story if provided)
  const storyElem = $("alternativeStory");
  if (altData.story && altData.story.length > 0) {
    storyElem.textContent = altData.story;
    storyElem.style.display = "block";
  } else if (altData.location) {
    storyElem.textContent = `Location: ${altData.location}`;
    storyElem.style.display = "block";
  } else {
    storyElem.textContent = "";
    storyElem.style.display = "none";
  }
  // Set metrics (jobs supported, CO2 savings)
  const metricsList = $("alternativeMetrics");
  metricsList.innerHTML = "";
  if (altData.metrics) {
    if (altData.metrics.jobs && altData.metrics.jobs !== "N/A") {
      const liJobs = document.createElement("li");
      liJobs.textContent = `Supports ${altData.metrics.jobs} local jobs`;
      metricsList.appendChild(liJobs);
    }
    if (altData.metrics.emissions && altData.metrics.emissions !== "N/A") {
      const liEm = document.createElement("li");
      liEm.textContent = (typeof altData.metrics.emissions === "string")
        ? altData.metrics.emissions 
        : `Reduces emissions by ${altData.metrics.emissions}`;
      metricsList.appendChild(liEm);
    }
  }
  // Show or hide the metrics list
  metricsList.style.display = (metricsList.childElementCount > 0) ? "block" : "none";
  // Set a category fact (if available) to highlight benefits
  const factElem = $("categoryFact");
  const catKey = productCategory ? productCategory.toLowerCase() : "";
  let factText = categoryFacts.default;
  if (catKey.includes("dairy")) {
    factText = categoryFacts.dairy;
  } else if (catKey.includes("beverage")) {
    factText = categoryFacts.beverage;
  }
  factElem.textContent = factText;
}

// Fetch product data from Open Food Facts for a given query (product name)
async function fetchFromOpenFoodFacts(query) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.products && data.products.length > 0) {
      const product = data.products[0];  // take first matching product
      // Determine a category tag for the product (used to find alternatives)
      let categoryTag = "";
      if (product.categories_tags && product.categories_tags.length > 0) {
        categoryTag = product.categories_tags[0];
        // Remove language prefix like "en:" if present
        if (categoryTag.indexOf(":") !== -1) {
          categoryTag = categoryTag.split(":").pop();
        }
      }
      return {
        name: product.product_name || query,
        origin: product.countries_tags || [],
        image: product.image_front_small_url 
               || product.image_front_url 
               || product.image_url 
               || "https://via.placeholder.com/100?text=No+Image",
        categoryTag: categoryTag
      };
    }
  } catch (err) {
    console.error("OpenFoodFacts API Error:", err);
  }
  return null;
}

// Helper for random integer in [min, max]
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
// Random Canadian city for demo purposes
const canadianCities = [
  "Toronto, Ontario", "Montreal, Quebec", "Vancouver, British Columbia",
  "Calgary, Alberta", "Edmonton, Alberta", "Winnipeg, Manitoba",
  "Ottawa, Ontario", "Halifax, Nova Scotia", "Saskatoon, Saskatchewan",
  "Quebec City, Quebec", "Regina, Saskatchewan", "St. John's, Newfoundland"
];
function randomCity() {
  return canadianCities[Math.floor(Math.random() * canadianCities.length)];
}

// Fetch Canadian alternatives in the same category, sorted by popularity
async function fetchAlternatives(categoryTag) {
  console.log('alternative');
  if (!categoryTag) return [];
  const url = `https://world.openfoodfacts.org/cgi/search.pl?action=process&search_simple=1&json=1` +
              `&tagtype_0=categories&tag_contains_0=contains&tag_0=${encodeURIComponent(categoryTag)}` +
              `&tagtype_1=countries&tag_contains_1=contains&tag_1=Canada` +
              `&sort_by=unique_scans_n&page_size=10`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (data.products) {
      // Map the products to our simplified alternative object list
      return data.products
        .filter(p => p.product_name)  // only include if name exists
        .map(p => {
          return {
            name: p.product_name,
            image: p.image_front_small_url 
                   || p.image_front_url 
                   || p.image_url 
                   || "https://via.placeholder.com/80?text=No+Image",
            origin: p.countries_tags || [],
            location: randomCity(),
            metrics: {
              jobs: randomInt(10, 50),
              emissions: `${randomInt(5, 30)}% lower CO2 emissions`
            },
            story: ""  // placeholder (could be filled with additional info if available)
          };
        });
    }
  } catch (err) {
    console.error("Error fetching alternatives:", err);
  }
  return [];
}

async function setDomFromProduct(product) {
  // Update UI with the found product's info
  console.log(product.name);
  
  console.log(JSON.parse(localStorage.getObject('product')));
  const resultsSection = $("resultSection");
  const statusMsg = $("statusMessage");
  $("productName").textContent = product.name;
  $("productOrigin").textContent = `Origin: ${capitalizeCountries(product.origin)}`;
  $("productImage").src = product.image;
  $("productImage").alt = product.name;
  resultsSection.style.display = "block";

  $("alternativeInfo").style.display = "none";
  $("alternativesContainer").style.display = "none";
  // Determine if the product is Canadian (origin includes Canada)
  const originTags = Array.isArray(product.origin) ? product.origin.map(x => x.toLowerCase()) 
                                                  : [String(product.origin).toLowerCase()];
  const isCanadian = originTags.some(tag => tag.includes("canada"));


  if (isCanadian) {
    // The product is already Canadian
    statusMsg.textContent = `Great news! "${product.name}" appears to be made or sold in Canada.`;
    statusMsg.style.display = "block";
    // No need to show alternatives in this case
    return;
  } else {
    // Product is not Canadian – find Canadian alternatives
    statusMsg.textContent = `This product looks international. Consider these Canadian alternatives:`;
    statusMsg.style.display = "block";
  }

  // Fetch alternatives in the same category
  console.log(product.categoryTag + " "+ product.name);
  const alternatives = await fetchAlternatives(product.categoryTag);
  if (!alternatives || alternatives.length === 0) {
    // No alternatives found for this category
    $("alternativeInfo").style.display = "none";
    $("alternativesContainer").style.display = "none";
    statusMsg.textContent = `No Canadian alternatives found for "${product.name}".`;
    statusMsg.style.display = "block";
    return;
  }
  $('altList').innerHTML='';  // Clear previous alternatives
  // Show alternatives list
  $("alternativesContainer").style.display = "block";
  let firstCard = null;
  alternatives.forEach((alt, index) => {
    // Create card element
    const card = document.createElement("div");
    card.className = "card";
    // Product image
    const img = document.createElement("img");
    img.src = alt.image;
    img.alt = alt.name;
    // Product name text
    const nameP = document.createElement("p");
    nameP.textContent = alt.name;
    console.log(alt.name);
    // Buy link (search on Walmart for this product)
    const buyLink = document.createElement("a");
    buyLink.href = `https://www.walmart.ca/search?q=${encodeURIComponent(alt.name)}`;
    buyLink.target = "_blank";
    buyLink.textContent = "Buy";
    buyLink.className = "buy-link";
    // Prevent card click when clicking the buy link
    buyLink.addEventListener("click", (e) => e.stopPropagation());
    // Assemble card
    card.appendChild(img);
    card.appendChild(nameP);
    card.appendChild(buyLink);
    // Card click to show details
    card.addEventListener("click", () => {
      highlightSelectedCard(card);
      displayAlternativeDetails(alt, product.categoryTag);
      $("alternativeInfo").style.display = "block";
    });
    $("altList").appendChild(card);
    if (index === 0) firstCard = card;
  });

  // Enable horizontal scrolling with arrows
  const altListEl = $("altList");
  const scrollLeftBtn = document.querySelector(".scroll-btn.left");
  const scrollRightBtn = document.querySelector(".scroll-btn.right");
  scrollLeftBtn.addEventListener("click", () => {
    altListEl.scrollBy({ left: -100, behavior: "smooth" });
  });
  scrollRightBtn.addEventListener("click", () => {
    altListEl.scrollBy({ left: 100, behavior: "smooth" });
  });
  // Show or hide arrows based on overflow
  if (altListEl.scrollWidth <= altListEl.clientWidth) {
    scrollLeftBtn.style.display = "none";
    scrollRightBtn.style.display = "none";
  } else {
    scrollLeftBtn.style.display = "block";
    scrollRightBtn.style.display = "block";
  }

  // Auto-select the first alternative to display details by default
  if (firstCard) {
    firstCard.click();
  }
}

// Perform the search and update the UI
async function performSearch(query) {
  localStorage.setItem('searchQuery', query);
  const resultsSection = $("resultSection");
  const messageBox = $("message");
  const statusMsg = $("statusMessage");
  const searchQuery = query.trim();
  if (!searchQuery) return;

  // Show a loading status
  resultsSection.style.display = "none";
  messageBox.style.display = "none";
  statusMsg.textContent = "Searching for product information...";
  statusMsg.style.display = "block";

  // Fetch product info from Open Food Facts
  const product = await fetchFromOpenFoodFacts(searchQuery);
  if (!product) {
    // No product found
    statusMsg.style.display = "none";
    resultsSection.style.display = "none";
    messageBox.textContent = `No product found for "${searchQuery}".`;
    messageBox.style.display = "block";
    return;
  }
  localStorage.setObject('product', JSON.stringify(product));
  setDomFromProduct(product);
  // Update UI with the found product's info
  // $("productName").textContent = product.name;
  // $("productOrigin").textContent = `Origin: ${capitalizeCountries(product.origin)}`;
  // $("productImage").src = product.image;
  // $("productImage").alt = product.name;
  // resultsSection.style.display = "block";

  // // Determine if the product is Canadian (origin includes Canada)
  // const originTags = Array.isArray(product.origin) ? product.origin.map(x => x.toLowerCase()) 
  //                                                 : [String(product.origin).toLowerCase()];
  // const isCanadian = originTags.some(tag => tag.includes("canada"));


  // if (isCanadian) {
  //   // The product is already Canadian
  //   statusMsg.textContent = `Great news! "${product.name}" appears to be made or sold in Canada.`;
  //   statusMsg.style.display = "block";
  //   // No need to show alternatives in this case
  //   return;
  // } else {
  //   // Product is not Canadian – find Canadian alternatives
  //   statusMsg.textContent = `This product looks international. Consider these Canadian alternatives:`;
  //   statusMsg.style.display = "block";
  // }

  // // Fetch alternatives in the same category
  // const alternatives = await fetchAlternatives(product.categoryTag);
  // if (!alternatives || alternatives.length === 0) {
  //   // No alternatives found for this category
  //   $("alternativeInfo").style.display = "none";
  //   $("alternativesContainer").style.display = "none";
  //   statusMsg.textContent = `No Canadian alternatives found for "${product.name}".`;
  //   statusMsg.style.display = "block";
  //   return;
  // }

  // // Show alternatives list
  // $("alternativesContainer").style.display = "block";
  // let firstCard = null;
  // alternatives.forEach((alt, index) => {
  //   // Create card element
  //   const card = document.createElement("div");
  //   card.className = "card";
  //   // Product image
  //   const img = document.createElement("img");
  //   img.src = alt.image;
  //   img.alt = alt.name;
  //   // Product name text
  //   const nameP = document.createElement("p");
  //   nameP.textContent = alt.name;
  //   // Buy link (search on Walmart for this product)
  //   const buyLink = document.createElement("a");
  //   buyLink.href = `https://www.walmart.ca/search?q=${encodeURIComponent(alt.name)}`;
  //   buyLink.target = "_blank";
  //   buyLink.textContent = "Buy";
  //   buyLink.className = "buy-link";
  //   // Prevent card click when clicking the buy link
  //   buyLink.addEventListener("click", (e) => e.stopPropagation());
  //   // Assemble card
  //   card.appendChild(img);
  //   card.appendChild(nameP);
  //   card.appendChild(buyLink);
  //   // Card click to show details
  //   card.addEventListener("click", () => {
  //     highlightSelectedCard(card);
  //     displayAlternativeDetails(alt, product.categoryTag);
  //     $("alternativeInfo").style.display = "block";
  //   });
  //   $("altList").appendChild(card);
  //   if (index === 0) firstCard = card;
  // });

  // // Enable horizontal scrolling with arrows
  // const altListEl = $("altList");
  // const scrollLeftBtn = document.querySelector(".scroll-btn.left");
  // const scrollRightBtn = document.querySelector(".scroll-btn.right");
  // scrollLeftBtn.addEventListener("click", () => {
  //   altListEl.scrollBy({ left: -100, behavior: "smooth" });
  // });
  // scrollRightBtn.addEventListener("click", () => {
  //   altListEl.scrollBy({ left: 100, behavior: "smooth" });
  // });
  // // Show or hide arrows based on overflow
  // if (altListEl.scrollWidth <= altListEl.clientWidth) {
  //   scrollLeftBtn.style.display = "none";
  //   scrollRightBtn.style.display = "none";
  // } else {
  //   scrollLeftBtn.style.display = "block";
  //   scrollRightBtn.style.display = "block";
  // }

  // // Auto-select the first alternative to display details by default
  // if (firstCard) {
  //   firstCard.click();
  // }
}

// Attempt to use any highlighted text on the page as the search query
function getHighlightedTextAndSearch() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs.length) return;
    const tabId = tabs[0].id;
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        func: () => window.getSelection().toString()
      },
      (results) => {
        if (chrome.runtime.lastError || !results || !results[0]) {
          // No selection or permission issue
          return;
        }
        const selectionText = results[0].result?.trim();
        if (selectionText) {
          $("searchInput").value = selectionText;
          performSearch(selectionText);
        }
      }
    );
  });
}
$('searchInput').value = localStorage.getItem('searchQuery') || '';
if ($('searchInput').value != '') {
  setDomFromProduct(JSON.parse(localStorage.getObject('product')));
  console.log(JSON.parse(localStorage.getObject('product')));
}
// Initialize event listeners after the popup DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  $("searchInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      performSearch(e.target.value);
    }
  });
  $("searchBtn").addEventListener("click", () => {
    performSearch($("searchInput").value);
  });
  $("settingsBtn").addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  // Check if a query was passed via context menu or URL
  const params = new URLSearchParams(window.location.search);
  const queryParam = params.get("query");
  if (queryParam) {
    $("searchInput").value = queryParam;
    performSearch(queryParam);
  } else {
    chrome.storage.local.get(["searchQuery", "trigger"], (data) => {
      if (data.trigger === "contextMenu" && data.searchQuery) {
        $("searchInput").value = data.searchQuery;
        performSearch(data.searchQuery);
        chrome.storage.local.remove(["searchQuery", "trigger"]);
      } else {
        // If no preset query, attempt to use highlighted text from the page
        getHighlightedTextAndSearch();
      }
    });
  }
});
