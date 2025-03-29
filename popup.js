// Data for demonstration: product info, Canadian alternatives, and user suggestions.
// In a real extension, this data would come from an API or database query.
const productData = {
    "Big Milk": {
      origin: "USA",
      image: "https://via.placeholder.com/100?text=Prod",  // Placeholder product image
      category: "dairy",
      alternatives: [
        {
          name: "Maple Dairy Co. 2% Milk",
          image: "https://via.placeholder.com/80?text=Maple",
          origin: "Canada",
          location: "Sudbury, Ontario",
          story: "A family-run dairy farm operating for over 50 years, providing fresh milk to the local community.",
          metrics: {
            jobs: 50,
            emissions: "15% lower carbon footprint"
          }
        },
        {
          name: "Cowtown Organic Milk",
          image: "https://via.placeholder.com/80?text=Cow",
          origin: "Canada",
          location: "Calgary, Alberta",
          story: "A cooperative of farmers known for high-quality organic dairy products.",
          metrics: {
            jobs: 20,
            emissions: "10% lower carbon emissions"
          }
        }
      ],
      suggestions: [
        {
          name: "Community Dairy Milk",
          image: "https://via.placeholder.com/80?text=User",
          origin: "Canada",
          location: "Toronto, Ontario",
          story: "",  // No story provided for user suggestion
          metrics: {
            jobs: 5,
            emissions: "N/A"
          }
        }
      ]
    },
    "Big Cola": {
      origin: "USA",
      image: "https://via.placeholder.com/100?text=Prod",
      category: "beverage",
      alternatives: [
        {
          name: "Maple Cola",
          image: "https://via.placeholder.com/80?text=Cola",
          origin: "Canada",
          location: "Montreal, Quebec",
          story: "A Canadian-owned soda company that makes cola sweetened with maple syrup.",
          metrics: {
            jobs: 30,
            emissions: "5% lower CO2 emissions"
          }
        }
      ],
      suggestions: []
    },
    "Pure Maple Syrup": {
      origin: "Canada",
      image: "https://via.placeholder.com/100?text=Prod",
      category: "food",
      alternatives: [],
      suggestions: []
    }
  };
  
  // Facts for each category to highlight benefits of choosing Canadian alternatives.
  const categoryFacts = {
    dairy: "Canadian dairy farmers adhere to high standards and a supply management system that supports thousands of local farms.",
    beverage: "Many Canadian beverage companies are independently owned. Choosing them supports local businesses and jobs.",
    default: "Choosing Canadian alternatives helps support local communities and reduce environmental impact."
  };
  
  // Helper to get DOM element by ID.
  function $(id) {
    return document.getElementById(id);
  }
  
  // Display details of the selected Canadian alternative in the info section.
  function displayAlternativeDetails(altData, productCategory) {
    // Set alternative name
    $("alternativeName").textContent = altData.name;
    // Set or hide the story/description
    const storyElem = $("alternativeStory");
    if (altData.story && altData.story.length > 0) {
      storyElem.textContent = altData.story;
      storyElem.style.display = "block";
    } else {
      storyElem.textContent = "";
      storyElem.style.display = "none";
    }
    // Set impact metrics (supports jobs, emissions reduction, etc.)
    const metricsList = $("alternativeMetrics");
    metricsList.innerHTML = "";  // clear previous metrics
    if (altData.metrics) {
      if (altData.metrics.jobs && altData.metrics.jobs !== "N/A") {
        const li = document.createElement("li");
        li.textContent = `Supports ${altData.metrics.jobs} local jobs`;
        metricsList.appendChild(li);
      }
      if (altData.metrics.emissions && altData.metrics.emissions !== "N/A") {
        const li = document.createElement("li");
        // If emissions is given as a descriptive string, use it directly; otherwise format it.
        li.textContent = typeof altData.metrics.emissions === "string" 
          ? altData.metrics.emissions 
          : `Reduces emissions by ${altData.metrics.emissions}`;
        metricsList.appendChild(li);
      }
    }
    // Show or hide the metrics list depending on content
    metricsList.style.display = (metricsList.childElementCount > 0) ? "block" : "none";
    // Set the category fact (if available for this category, otherwise use default message)
    const factElem = $("categoryFact");
    const factText = categoryFacts[productCategory] || categoryFacts.default;
    factElem.textContent = factText;
  }
  
  // Highlight the selected card visually and remove highlight from others.
  function highlightSelectedCard(cardElement) {
    const prevSelected = document.querySelector(".card.selected");
    if (prevSelected) prevSelected.classList.remove("selected");
    cardElement.classList.add("selected");
  }
  async function fetchFromOpenFoodFacts(query) {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.products && data.products.length > 0) {
        const product = data.products[0];
        return {
          name: product.product_name || query,
          origin: product.countries_tags || [],
          brand: product.brands || "Unknown",
          image: product.image_url || "https://via.placeholder.com/100?text=No+Image"
        };
      }
    } catch (err) {
      console.error("API Error:", err);
    }
    return null;
  }
  
  
  // Perform a search for the given product query and update the popup UI.
  async function performSearch(query) {
    const resultsSection = $("resultSection");
    const messageBox = $("message");
    const statusMsg = $("statusMessage");
    const searchQuery = query.trim();
    if (!searchQuery) return;  // do nothing if query is empty
  
    // Case-insensitive match for the product name in our data.
    const queryLower = searchQuery.toLowerCase();
    let productKey = null;
    for (let name in productData) {
      if (name.toLowerCase() === queryLower) {
        productKey = name;
        break;
      }
    }
  
    if (!productKey) {
      // Try partial match if exact not found.
      for (let name in productData) {
        if (name.toLowerCase().includes(queryLower) || queryLower.includes(name.toLowerCase())) {
          productKey = name;
          break;
        }
      }
    }
  
    // ✅ ✅ ✅ Fallback to Open Food Facts API
    if (!productKey) {
      const apiProduct = await fetchFromOpenFoodFacts(searchQuery);
  
      if (!apiProduct) {
        resultsSection.style.display = "none";
        statusMsg.style.display = "none";
        messageBox.textContent = `No product found for "${searchQuery}".`;
        messageBox.style.display = "block";
        return;
      }
  
      const isCanadian = apiProduct.origin.includes("en:canada");
  
      $("productName").textContent = apiProduct.name;
      $("productOrigin").textContent = `Origin: ${apiProduct.origin.join(", ").replace(/en:/g, '')}`;
      $("productImage").src = apiProduct.image;
      $("productImage").alt = apiProduct.name;
  
      resultsSection.style.display = "block";
      messageBox.style.display = "none";
      $("alternativeInfo").style.display = "none";
      $("alternativesContainer").style.display = "none";
      $("suggestionsContainer").style.display = "none";
  
      if (isCanadian) {
        statusMsg.textContent = `Great news! "${apiProduct.name}" appears to be made or sold in Canada.`;
      } else {
        statusMsg.textContent = `This product appears to be international. Please consider a Canadian alternative.`;
      }
  
      statusMsg.style.display = "block";
      return;
    }

    const product = productData[productKey];
    $("productName").textContent = productKey;
    $("productOrigin").textContent = `Origin: ${product.origin}`;
    const prodImgElem = $("productImage");
    prodImgElem.src = product.image;
    prodImgElem.alt = productKey;
  
    messageBox.style.display = "none";
    resultsSection.style.display = "block";
  
    if (product.origin.toLowerCase() === "canada") {
      $("alternativesContainer").style.display = "none";
      $("suggestionsContainer").style.display = "none";
      $("alternativeInfo").style.display = "none";
      statusMsg.textContent = `Great news! "${productKey}" is made in Canada.`;
      statusMsg.style.display = "block";
      return;
    }
  
    // Show alternatives
    statusMsg.style.display = "none";
    $("alternativeInfo").style.display = "block";
    const altContainer = $("alternativesContainer");
    const sugContainer = $("suggestionsContainer");
  
    $("altList").innerHTML = "";
    $("suggestionList").innerHTML = "";
    altContainer.style.display = "block";
    sugContainer.style.display = "block";
  
    let firstCard = null;
    product.alternatives.forEach((alt, index) => {
      const card = document.createElement("div");
      card.className = "card";
      const img = document.createElement("img");
      img.src = alt.image;
      img.alt = alt.name;
      const nameP = document.createElement("p");
      nameP.textContent = alt.name;
      card.appendChild(img);
      card.appendChild(nameP);
      card.addEventListener("click", () => {
        highlightSelectedCard(card);
        displayAlternativeDetails(alt, product.category);
      });
      $("altList").appendChild(card);
      if (index === 0) {
        firstCard = card;
      }
    });
  
    product.suggestions.forEach((alt, index) => {
      const card = document.createElement("div");
      card.className = "card";
      const img = document.createElement("img");
      img.src = alt.image;
      img.alt = alt.name;
      const nameP = document.createElement("p");
      nameP.textContent = alt.name;
      card.appendChild(img);
      card.appendChild(nameP);
      card.addEventListener("click", () => {
        highlightSelectedCard(card);
        displayAlternativeDetails(alt, product.category);
      });
      $("suggestionList").appendChild(card);
      if (!firstCard && index === 0) {
        firstCard = card;
      }
    });
  
    if (product.alternatives.length === 0) {
      altContainer.style.display = "none";
    }
    if (product.suggestions.length === 0) {
      sugContainer.style.display = "none";
    }
    if (product.alternatives.length === 0 && product.suggestions.length === 0) {
      $("alternativeInfo").style.display = "none";
      statusMsg.textContent = `No Canadian alternatives found for "${productKey}".`;
      statusMsg.style.display = "block";
      return;
    }
  
    if (firstCard) {
      firstCard.click();
    }
  }
  
  // Try to use any highlighted text from the active tab as the search query.
  function getHighlightedTextAndSearch() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0]) return;
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () => window.getSelection().toString()
        },
        (results) => {
          if (chrome.runtime.lastError) {
            // Cannot inject into this page (e.g. Chrome Web Store or restricted page)
            return;
          }
          const selectionText = results && results[0] && results[0].result;
          if (selectionText) {
            $("searchInput").value = selectionText;
            performSearch(selectionText);
          }
        }
      );
    });
  }
  
  // Initialize event listeners after DOM is loaded
  document.addEventListener("DOMContentLoaded", () => {
    // Search when "Enter" key is pressed in the input
    $("searchInput").addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        performSearch(e.target.value);
      }
    });
    // Search when clicking the search button
    $("searchBtn").addEventListener("click", () => {
      performSearch($("searchInput").value);
    });
    // Open the settings/options page when clicking the gear icon
    $("settingsBtn").addEventListener("click", () => {
      chrome.runtime.openOptionsPage();
    });
  
    
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
          getHighlightedTextAndSearch();
        }
      });
    }
  });
  
