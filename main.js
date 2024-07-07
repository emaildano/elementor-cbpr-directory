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
      contactEmail: post.dataset.contactEmail,
      disputeResolution: post.dataset.disputeResolution ? ensureQualifiedUrl(post.dataset.disputeResolution) : '',
      agentUrl: post.dataset.agentUrl ? ensureQualifiedUrl(post.dataset.agentUrl) : '',
      agentDescription: post.dataset.agentDescription,
      enforcementAuthorities: post.dataset.enforcementAuthorities,
      scope: post.dataset.scope
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
        const scope = post.dataset.scope;

        document.getElementById('modal-1-title').innerHTML = website ? `<a href="${website}" target="_blank">${name}</a>` : name;
        document.getElementById('modal-1-content').innerHTML = `
          <div class="cbpr__certs">
            ${cbpr ? `<p class="cbpr--badge"><b>${cbpr}</b></p>` : ''}
            ${prp ? `<p class="cbpr--badge"><b>${prp}</b></p>` : ''}
          </div>
          <p><b>Certified in:</b> ${country}</p>
          <p><b>Accountability Agent:</b> <a href="${agentUrl}" target="_blank">${agent}</a></p>
          <p><b>Certification Valid From:</b> ${validFrom}</p>
          <p><b>Certification Valid Until:</b> ${validUntil}</p>
          ${website ? `<p><b>Organization Website:</b> <a href="${website}" target="_blank">${website}</a></p>` : ''}
          ${privacyStatement ? `<p><b>Organization Privacy Statement:</b> <a href="${privacyStatement}" target="_blank">${privacyStatement}</a></p>` : ''}
          <p><b>Organization Contact Name:</b> ${contactName}</p>
          ${contactEmail ? `<p><b>Organization Contact Email:</b> <a href="mailto:${contactEmail}">${contactEmail}</a></p>` : ''}
          ${disputeResolution ? `<p><b>Dispute Resolution:</b> <a href="${disputeResolution}" target="_blank">${disputeResolution}</a></p>` : ''}
          <p><b>Accountability Agents Description:</b> ${agentDescription}</p>
          <p><b>Privacy Enforcement Authorities:</b> ${enforcementAuthorities}</p>
          <p><b>Scope of Certification:</b> ${scope}</p>
        `;

        MicroModal.show('modal-1');
      });
    });
  };

  renderPosts(posts);
  attachPostClickHandlers();
});
