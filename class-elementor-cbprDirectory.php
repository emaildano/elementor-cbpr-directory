<?php
/**
 * Elementor_cbprDirectory_widget class.
 *
 * @category   Class
 * @package    Elementor CBPR Directory
 * @subpackage WordPress
 * @since      1.0.0
 * php version 7.3.9
 */
if ( ! defined( 'ABSPATH' ) ) {
    // Exit if accessed directly.
    exit;
}
/**
 * Main Elementor CBPR Directory Class
 *
 * The init class that runs the Elementor CBPR Directory plugin.
 * Intended To make sure that the plugin's minimum requirements are met.
 *
 * Any custom code should go inside Plugin Class in the class-widgets.php file.
 */
final class Elementor_cbprDirectory_widget {
    /**
     * Plugin Version
     *
     * @since 1.0.0
     * @var string The plugin version.
     */
    const VERSION = '1.0.0';
    /**
     * Minimum Elementor Version
     *
     * @since 1.0.0
     * @var string Minimum Elementor version required to run the plugin.
     */
    const MINIMUM_ELEMENTOR_VERSION = '2.0.0';
    /**
     * Minimum PHP Version
     *
     * @since 1.0.0
     * @var string Minimum PHP version required to run the plugin.
     */
    const MINIMUM_PHP_VERSION = '7.0';
    /**
     * Constructor
     *
     * @since 1.0.0
     * @access public
     */
    public function __construct() {
        // Load the translation.
        add_action( 'init', array( $this, 'i18n' ) );
        // Initialize the plugin.
        add_action( 'plugins_loaded', array( $this, 'init' ) );
    }
    /**
     * Load Textdomain
     *
     * Load plugin localization files.
     * Fired by `init` action hook.
     *
     * @since 1.0.0
     * @access public
     */
    public function i18n() {
        load_plugin_textdomain( 'elementor-cbprDirectory' );
    }
    /**
     * Initialize the plugin
     *
     * Validates that Elementor is already loaded.
     * Checks for basic plugin requirements, if one check fail don't continue,
     * if all check have passed include the plugin class.
     *
     * Fired by `plugins_loaded` action hook.
     *
     * @since 1.0.0
     * @access public
     */
    public function init() {
        // Check if Elementor installed and activated.
        if ( ! did_action( 'elementor/loaded' ) ) {
            add_action( 'admin_notices', array( $this, 'admin_notice_missing_main_plugin' ) );
            return;
        }
        // Check for required Elementor version.
        if ( ! version_compare( ELEMENTOR_VERSION, self::MINIMUM_ELEMENTOR_VERSION, '>=' ) ) {
            add_action( 'admin_notices', array( $this, 'admin_notice_minimum_elementor_version' ) );
            return;
        }
        // Check for required PHP version.
        if ( version_compare( PHP_VERSION, self::MINIMUM_PHP_VERSION, '<' ) ) {
            add_action( 'admin_notices', array( $this, 'admin_notice_minimum_php_version' ) );
            return;
        }
        // Once we get here, We have passed all validation checks so we can safely include our widgets.
        require_once 'class-widgets.php';
    }
    /**
     * Admin notice
     *
     * Warning when the site doesn't have Elementor installed or activated.
     *
     * @since 1.0.0
     * @access public
     */
    public function admin_notice_missing_main_plugin() {
        deactivate_plugins( plugin_basename( Elementor_cbprDirectory_widget ) );
        return sprintf(
            wp_kses(
                '<div class="notice notice-warning is-dismissible"><p><strong>"%1$s"</strong> requires <strong>"%2$s"</strong> to be installed and activated.</p></div>',
                array(
                    'div' => array(
                        'class'  => array(),
                        'p'      => array(),
                        'strong' => array(),
                    ),
                )
            ),
            'Elementor CBPR Directory',
            'Elementor'
        );
    }
    /**
     * Admin notice
     *
     * Warning when the site doesn't have a minimum required Elementor version.
     *
     * @since 1.0.0
     * @access public
     */
    public function admin_notice_minimum_elementor_version() {
        deactivate_plugins( plugin_basename( Elementor_cbprDirectory_widget ) );
        return sprintf(
            wp_kses(
                '<div class="notice notice-warning is-dismissible"><p><strong>"%1$s"</strong> requires <strong>"%2$s"</strong> version %3$s or greater.</p></div>',
                array(
                    'div' => array(
                        'class'  => array(),
                        'p'      => array(),
                        'strong' => array(),
                    ),
                )
            ),
            'Elementor CBPR Directory',
            'Elementor',
            self::MINIMUM_ELEMENTOR_VERSION
        );
    }
    /**
     * Admin notice
     *
     * Warning when the site doesn't have a minimum required PHP version.
     *
     * @since 1.0.0
     * @access public
     */
    public function admin_notice_minimum_php_version() {
        deactivate_plugins( plugin_basename( Elementor_cbprDirectory_widget ) );
        return sprintf(
            wp_kses(
                '<div class="notice notice-warning is-dismissible"><p><strong>"%1$s"</strong> requires <strong>"%2$s"</strong> version %3$s or greater.</p></div>',
                array(
                    'div' => array(
                        'class'  => array(),
                        'p'      => array(),
                        'strong' => array(),
                    ),
                )
            ),
            'Elementor CBPR Directory',
            'Elementor',
            self::MINIMUM_ELEMENTOR_VERSION
        );
    }
}

new Elementor_cbprDirectory_widget();