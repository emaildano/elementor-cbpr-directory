const ensureQualifiedUrl = (url) => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'http://' + url;
  }
  return url;
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const countryFilter = document.getElementById("countryFilter");
  const agentFilter = document.getElementById("agentFilter");
  const certTypeFilter = document.getElementById("certTypeFilter");
  const clearFiltersButton = document.getElementById("clearFilters");
  const postsContainer = document.getElementById("postsContainer");
  const resultsTitle = document.getElementById("resultsTitle");
  const pipeSeparator = document.querySelector(".pipe-separator");

  const extractPostData = () => {
    return Array.from(postsContainer.getElementsByClassName("cbpr--post")).map(post => ({
      element: post,
      name: post.dataset.name,
      country: post.dataset.country,
      accountabilityAgent: post.dataset.agent,
      validFrom: post.dataset.validfrom,
      validUntil: post.dataset.validuntil,
      cbpr: post.dataset.cbpr === 'TRUE',
      prp: post.dataset.prp === 'TRUE',
      website: post.dataset.website ? ensureQualifiedUrl(post.dataset.website) : '',
      privacyStatement: post.dataset.privacyStatement ? ensureQualifiedUrl(post.dataset.privacyStatement) : '',
      contactName: post.dataset.contactName,
      contactEmail: isValidEmail(post.dataset.contactEmail) ? post.dataset.contactEmail : '',
      disputeResolution: post.dataset.disputeResolution ? ensureQualifiedUrl(post.dataset.disputeResolution) : '',
      agentUrl: post.dataset.agentUrl ? ensureQualifiedUrl(post.dataset.agentUrl) : '',
      agentDescription: post.dataset.agentDescription,
      enforcementAuthorities: post.dataset.enforcementAuthorities,
      peaWebsite: post.dataset.peaWebsite ? ensureQualifiedUrl(post.dataset.peaWebsite) : '',
      scope: post.dataset.scope,
      agentPhone: post.dataset.agentPhone,
      agentAddress: post.dataset.agentAddress
    }));
  };

  const renderPosts = (posts) => {
    const fragment = document.createDocumentFragment();
    posts.forEach(post => fragment.appendChild(post.element));
    postsContainer.innerHTML = "";
    postsContainer.appendChild(fragment);
    updateResultsTitle(posts.length);
    toggleClearButtonAndPipe();
    attachPostClickHandlers();
  };

  const updateResultsTitle = (count) => {
    const filtersApplied = searchInput.value || countryFilter.value || agentFilter.value || certTypeFilter.value;
    const filterText = filtersApplied ? " based on currently selected filters" : "";
    const organizationText = count === 1 ? "Organization" : "Organizations";
    resultsTitle.textContent = `${count} Participating ${organizationText}${filterText}`;
  };

  const toggleClearButtonAndPipe = () => {
    const filtersApplied = searchInput.value || countryFilter.value || agentFilter.value || certTypeFilter.value;
    clearFiltersButton.style.display = filtersApplied ? 'inline-block' : 'none';
    pipeSeparator.style.display = filtersApplied ? 'inline-block' : 'none';
  };

  const posts = extractPostData();
  const uniqueCountries = [...new Set(posts.map(post => post.country))].sort();
  const uniqueAgents = [...new Set(posts.map(post => post.accountabilityAgent))].sort();
  const uniqueCertTypes = [...new Set(posts.flatMap(post => [
    post.cbpr ? 'Global CBPR' : null,
    post.prp ? 'Global PRP' : null,
    (post.cbpr && post.prp) ? 'Both Global CBPR and Global PRP' : null
  ].filter(Boolean)))].sort();

  const populateFilter = (filterElement, options) => {
    options.forEach(option => {
      const optElement = document.createElement("option");
      optElement.value = option;
      optElement.textContent = option;
      filterElement.appendChild(optElement);
    });
  };

  populateFilter(countryFilter, uniqueCountries);
  populateFilter(agentFilter, uniqueAgents);
  populateFilter(certTypeFilter, uniqueCertTypes);

  const fuse = new Fuse(posts, {
    keys: ["name", "country", "accountabilityAgent", "validFrom", "validUntil"],
  });

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  const performSearch = () => {
    const searchText = searchInput.value.trim();
    const selectedCountry = countryFilter.value;
    const selectedAgent = agentFilter.value;
    const selectedCertType = certTypeFilter.value;

    let filteredPosts = posts;

    if (searchText !== "") {
      const result = fuse.search(searchText);
      filteredPosts = result.map(({ item }) => item);
    }

    if (selectedCountry !== "") {
      filteredPosts = filteredPosts.filter(post => post.country === selectedCountry);
    }

    if (selectedAgent !== "") {
      filteredPosts = filteredPosts.filter(post => post.accountabilityAgent === selectedAgent);
    }

    if (selectedCertType !== "") {
      filteredPosts = filteredPosts.filter(post =>
        (selectedCertType === 'Global CBPR' && post.cbpr) ||
        (selectedCertType === 'Global PRP' && post.prp) ||
        (selectedCertType === 'Both Global CBPR and Global PRP' && post.cbpr && post.prp)
      );
    }

    renderPosts(filteredPosts);
  };

  const debouncedPerformSearch = debounce(performSearch, 300);
  searchInput.addEventListener("keyup", debouncedPerformSearch);
  countryFilter.addEventListener("change", debouncedPerformSearch);
  agentFilter.addEventListener("change", debouncedPerformSearch);
  certTypeFilter.addEventListener("change", debouncedPerformSearch);

  clearFiltersButton.addEventListener("click", () => {
    searchInput.value = '';
    countryFilter.value = '';
    agentFilter.value = '';
    certTypeFilter.value = '';
    renderPosts(posts); // Render all posts
  });

  const attachPostClickHandlers = () => {
    document.querySelectorAll('.cbpr--post').forEach(post => {
      post.addEventListener('click', () => {
        const name = post.dataset.name;
        const country = post.dataset.country;
        const agent = post.dataset.agent;
        const validFrom = post.dataset.validfrom;
        const validUntil = post.dataset.validuntil;
        const cbpr = post.dataset.cbpr === 'TRUE' ? 'Global CBPR' : '';
        const prp = post.dataset.prp === 'TRUE' ? 'Global PRP' : '';
        const website = post.dataset.website ? ensureQualifiedUrl(post.dataset.website) : '';
        const privacyStatement = post.dataset.privacyStatement ? ensureQualifiedUrl(post.dataset.privacyStatement) : '';
        const contactName = post.dataset.contactName;
        const contactEmail = isValidEmail(post.dataset.contactEmail) ? post.dataset.contactEmail : '';
        const disputeResolution = post.dataset.disputeResolution ? ensureQualifiedUrl(post.dataset.disputeResolution) : '';
        const agentUrl = post.dataset.agentUrl ? ensureQualifiedUrl(post.dataset.agentUrl) : '';
        const agentDescription = post.dataset.agentDescription;
        const enforcementAuthorities = post.dataset.enforcementAuthorities;
        const peaWebsite = post.dataset.peaWebsite ? ensureQualifiedUrl(post.dataset.peaWebsite) : '';
        const scope = post.dataset.scope;
        const agentPhone = post.dataset.agentPhone;
        const agentAddress = post.dataset.agentAddress;

        document.getElementById('modal-1-title').innerHTML = website ? `<a href="${website}" target="_blank">${name}</a>` : name;
        document.getElementById('modal-1-content').innerHTML = `
          <div class="cbpr__certs">
            ${cbpr ? `<p class="cbpr--badge"><b>${cbpr}</b></p>` : ''}
            ${prp ? `<p class="cbpr--badge"><b>${prp}</b></p>` : ''}
          </div>
          <p><b>Certified in:</b> ${country}</p>
          <p><b>Certification Valid From:</b> ${validFrom}</p>
          <p><b>Certification Valid Until:</b> ${validUntil}</p>

          <h4>Organization Details</h4>
          <hr>
          ${website ? `<p><b>Website:</b> <a href="${website}" target="_blank">${website}</a></p>` : ''}
          ${privacyStatement ? `<p><b>Privacy Statement:</b> <a href="${privacyStatement}" target="_blank">${privacyStatement}</a></p>` : ''}
          <p><b>Contact Name:</b> ${contactName}</p>
          ${contactEmail ? `<p><b>Contact Email:</b> <a href="mailto:${contactEmail}">${contactEmail}</a></p>` : ''}

          <h4>Accountability Agent Information</h4>
          <hr>
          <p><b>Agent:</b> <a href="${agentUrl}" target="_blank">${agent}</a></p>
          ${agentPhone ? `<p><b>Agent Phone:</b> ${agentPhone}</p>` : ''}
          ${agentAddress ? `<p><b>Agent Address:</b> ${agentAddress}</p>` : ''}
          <p><b>Agent Description:</b> ${agentDescription}</p>

          <h4>Privacy Enforcement Authorities</h4>
          <hr>
          <p>${peaWebsite ? `<a href="${peaWebsite}" target="_blank">${enforcementAuthorities}</a>` : enforcementAuthorities}</p>

          <h4>Scope of Certification</h4>
          <p>${scope}</p>
        `;

        MicroModal.show('modal-1');
      });
    });
  };

  renderPosts(posts);
  attachPostClickHandlers();
});


// Collect country links and add them to the "Filter by Jurisdiction" section
document.addEventListener('DOMContentLoaded', function () {
  // Find all articles
  const articles = document.querySelectorAll('article');

  // Initialize an array to store the collected links
  const countryLinks = [];
  const addedLinks = new Set(); // To track added links and avoid duplicates

  // Find the container where we want to add the new jurisdictions
  const jurisdictionContainer = document.querySelector('.elementor-widget-container .ae-custom-tax-wrapper .ae-custom-tax');

  // Check if the jurisdiction container was found
  if (!jurisdictionContainer) {
    console.error('Jurisdiction container not found.');
    return;
  }

  // Collect existing links in the jurisdiction container to avoid duplicates
  const existingLinks = jurisdictionContainer.querySelectorAll('h5.ae-term-item a');
  existingLinks.forEach(function (link) {
    addedLinks.add(link.textContent.trim());
  });

  // Iterate over each article
  articles.forEach(function (article) {
    // Find all h6 elements within the article
    const links = article.querySelectorAll('h6.ae-term-item');

    // Iterate over each link and collect its information
    links.forEach(function (link) {
      const anchor = link.querySelector('a');
      const linkInfo = {
        text: anchor.textContent.trim(),
        href: anchor.href,
        title: anchor.title
      };

      // Check if the link has already been added
      if (!addedLinks.has(linkInfo.text)) {
        addedLinks.add(linkInfo.text); // Add the link text to the set
        countryLinks.push(linkInfo);
      }
    });
  });

  // Iterate over the collected links and add them to the jurisdiction container
  countryLinks.forEach(function (linkInfo) {
    const newLink = document.createElement('h5');
    newLink.className = 'ae-term-item ae-term-' + linkInfo.text.toLowerCase().replace(/ /g, '-');
    newLink.innerHTML = `<a href="${linkInfo.href}" title="${linkInfo.title}">${linkInfo.text}</a>`;
    jurisdictionContainer.appendChild(newLink); // Append to the new container
  });
});
