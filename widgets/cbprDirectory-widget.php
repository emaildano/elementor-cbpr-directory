<?php
if (!defined('ABSPATH')) {
  exit; // Exit if accessed directly.
}

// Check if the CBPR - API Keys and Settings plugin is active
include_once(ABSPATH . 'wp-admin/includes/plugin.php');
if (!is_plugin_active('cbpr-settings/cbpr-settings.php')) {
  deactivate_plugins(plugin_basename(__FILE__));
  wp_die('This plugin requires the CBPR - API Keys and Settings plugin to be active.');
}

/**
 * Elementor cbprDirectory Widget.
 *
 * Elementor widget that inserts the CBPR directory data from the custom post type.
 *
 * @since 1.0.0
 */
class Elementor_cbprDirectory_Widget extends \Elementor\Widget_Base
{
  public function get_name()
  {
    return 'cbprDirectory';
  }

  public function get_title()
  {
    return esc_html__('cbprDirectory', 'elementor-cbprDirectory-widget');
  }

  public function get_icon()
  {
    return 'eicon-code';
  }

  public function get_custom_help_url()
  {
    return 'https://dai.com';
  }

  public function get_categories()
  {
    return ['general'];
  }

  public function get_keywords()
  {
    return ['cbprDirectory', 'directory', 'cbpr'];
  }

  protected function register_controls()
  {
    // Add controls here if needed
  }

  protected function render()
  {
    $api_key = get_option('cbpr_api_key');
    $google_spreadsheet_ID = get_option('cbpr_google_spreadsheet_id');

    // Check if the API key and Google Spreadsheet ID are set
    if (empty($api_key) || empty($google_spreadsheet_ID)) {
      echo '<div class="cbpr__error">The CBPR Settings plugin is not active. Please activate the CBPR - API Keys and Settings plugin.</div>';
      return;
    }

    $get_sheet = new WP_Http();
    $sheet_url = "https://sheets.googleapis.com/v4/spreadsheets/{$google_spreadsheet_ID}/values/CBPR Display!1:1000?key={$api_key}";
    $sheet_response = $get_sheet->get($sheet_url);

    // Check if the request was successful
    if (is_wp_error($sheet_response) || $sheet_response['response']['code'] != 200) {
      echo '<div class="cbpr__error">Failed to retrieve data from Google Sheets. Please check the API key and Spreadsheet ID.</div>';
      return;
    }

    $json_body = json_decode($sheet_response['body'], true);
    $cbpr_data = array_values($json_body)[2];
    $cbpr_count = count($cbpr_data) - 1;

    // FOR TESTING & DEBUGGING
    // Output the array as JSON to be logged in the console
    // $cbpr_data_json = json_encode($cbpr_data);
    // echo "<script>console.log('CBPR Data: ', $cbpr_data_json);</script>";
?>

    <?php
    if ($cbpr_count > 0) : ?>
      <div class="modal micromodal-slide" id="modal-1" aria-hidden="true">
        <div class="modal__overlay" tabindex="-1" data-micromodal-close>
          <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-1-title">
            <header class="modal__header">
              <h2 class="modal__title" id="modal-1-title">Organization Details</h2>
              <button class="modal__close" aria-label="Close modal" data-micromodal-close></button>
            </header>
            <main class="modal__content" id="modal-1-content">
              <!-- Content will be dynamically injected here -->
            </main>
          </div>
        </div>
      </div>

      <div class="cbpr__search-header">
        <div id="resultsTitle" class="cbpr__header-title">
          <?php echo $cbpr_count; ?> Participating Organizations
        </div>
        <span class="pipe-separator">|</span>
        <button id="clearFilters">Clear Filters</button>
      </div>

      <div class="cbpr-search">
        <input class="cbpr-search-input" type="search" id="searchInput" placeholder="Search..." />
        <select id="countryFilter">
          <option value="">All Countries</option>
        </select>
        <select id="agentFilter">
          <option value="">All Agents</option>
        </select>
        <select id="certTypeFilter">
          <option value="">All Certifications</option>
        </select>
      </div>

      <div class="compliance_table data_table hide-until-load cbpr_landing" id="postsContainer">
        <?php
        function renderPost($name, $country, $agent, $validFrom, $validUntil, $cbpr, $prp, $website, $privacyStatement, $contactName, $contactEmail, $disputeResolution, $agentUrl, $agentDescription, $enforcementAuthorities, $scope)
        {
          $name = htmlspecialchars($name ?? '', ENT_QUOTES, 'UTF-8');
          $country = htmlspecialchars($country ?? '', ENT_QUOTES, 'UTF-8');
          $agent = htmlspecialchars($agent ?? '', ENT_QUOTES, 'UTF-8');
          $validFrom = htmlspecialchars($validFrom ?? '', ENT_QUOTES, 'UTF-8');
          $validUntil = htmlspecialchars($validUntil ?? '', ENT_QUOTES, 'UTF-8');
          $cbprBadge = $cbpr === 'TRUE' ? '<p class="cbpr--badge"><b>Global CBPR</b></p>' : '';
          $prpBadge = $prp === 'TRUE' ? '<p class="cbpr--badge"><b>Global PRP</b></p>' : '';
          $website = htmlspecialchars($website ?? '', ENT_QUOTES, 'UTF-8');
          $privacyStatement = htmlspecialchars($privacyStatement ?? '', ENT_QUOTES, 'UTF-8');
          $contactName = htmlspecialchars($contactName ?? '', ENT_QUOTES, 'UTF-8');
          $contactEmail = htmlspecialchars($contactEmail ?? '', ENT_QUOTES, 'UTF-8');
          $disputeResolution = htmlspecialchars($disputeResolution ?? '', ENT_QUOTES, 'UTF-8');
          $agentUrl = htmlspecialchars($agentUrl ?? '', ENT_QUOTES, 'UTF-8');
          $agentDescription = htmlspecialchars($agentDescription ?? '', ENT_QUOTES, 'UTF-8');
          $enforcementAuthorities = htmlspecialchars($enforcementAuthorities ?? '', ENT_QUOTES, 'UTF-8');
          $scope = htmlspecialchars($scope ?? '', ENT_QUOTES, 'UTF-8');

          return <<<HTML
                  <div class="cbpr--post" 
                    data-name="$name" 
                    data-country="$country" 
                    data-agent="$agent" 
                    data-validfrom="$validFrom" 
                    data-validuntil="$validUntil" 
                    data-cbpr="$cbpr" 
                    data-prp="$prp"
                    data-website="$website"
                    data-privacy-statement="$privacyStatement"
                    data-contact-name="$contactName"
                    data-contact-email="$contactEmail"
                    data-dispute-resolution="$disputeResolution"
                    data-agent-url="$agentUrl"
                    data-agent-description="$agentDescription"
                    data-enforcement-authorities="$enforcementAuthorities"
                    data-scope="$scope">
                    <div class="cbpr--post-more" title="More information about this organization">&#9432; More info</div>
                    <div class="cbpr--post-head">
                      <p class="cbpr--post-title">$name</p>
                      $cbprBadge
                      $prpBadge
                    </div>
                    <div class="cbpr--post-meta">
                      <p class="cbpr--country"><b>Certified in:</b> $country</p>
                      <p class="cbpr--agent"><b>Accountability Agent:</b> $agent</p>
                    </div>
                    <div class="cbpr--post-meta">
                      <p class="cbpr--valid-from"><b>Certification Valid From:</b> $validFrom</p>
                      <p class="cbpr--valid-until"><b>Certification Valid Until:</b> $validUntil</p>
                    </div>
                  </div>
                  HTML;
        }

        foreach (array_slice($cbpr_data, 1) as $elem) {
          $name = $elem[0] ?? '';
          $country = $elem[1] ?? '';
          $agent = $elem[2] ?? '';
          $validFrom = $elem[3] ?? '';
          $validUntil = $elem[4] ?? '';
          $cbpr = $elem[5] ?? '';
          $prp = $elem[6] ?? '';
          $website = $elem[7] ?? '';
          $privacyStatement = $elem[8] ?? '';
          $contactName = $elem[9] ?? '';
          $contactEmail = $elem[10] ?? '';
          $disputeResolution = $elem[11] ?? '';
          $agentUrl = $elem[12] ?? '';
          $agentDescription = $elem[13] ?? '';
          $enforcementAuthorities = $elem[14] ?? '';
          $scope = $elem[15] ?? '';

          echo renderPost($name, $country, $agent, $validFrom, $validUntil, $cbpr, $prp, $website, $privacyStatement, $contactName, $contactEmail, $disputeResolution, $agentUrl, $agentDescription, $enforcementAuthorities, $scope);
        }
        ?>
      </div>

    <?php else : ?>
      <div class="cbpr__header-title">
        No CBPR directory entries to display.
      </div>
<?php endif;
  }
}
?>