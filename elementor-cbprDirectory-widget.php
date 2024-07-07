<?php

/**
 * Plugin Name: CBPR - Certified Organizations - Elementor Widget
 * Description: Create a directory of CBPR post types in Elementor.
 * Version:     1.0.0
 * Author:      DAI
 * Text Domain: elementor-cbprDirectory-widget
 *
 * Elementor tested up to: 3.5.0
 * Elementor Pro tested up to: 3.5.0
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * Register CBPR Directory Widget.
 *
 * Include widget file and register widget class.
 *
 * @since 1.0.0
 * @param \Elementor\Widgets_Manager $widgets_manager Elementor widgets manager.
 * @return void
 */
function register_cbprDirectory_widget($widgets_manager)
{

    require_once(__DIR__ . '/widgets/cbprDirectory-widget.php');

    $widgets_manager->register(new \Elementor_cbprDirectory_Widget());
}
add_action('elementor/widgets/register', 'register_cbprDirectory_widget');


// Scripts
add_action('wp_enqueue_scripts', 'plugin_assets');
function plugin_assets()
{
    wp_register_script('fuse', 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0');
    wp_enqueue_script('fuse');

    wp_register_script('micromodal', 'https://cdn.jsdelivr.net/npm/micromodal@0.4.10/dist/micromodal.min.js');
    wp_enqueue_script('micromodal');

    wp_register_script('cbpr-main', plugins_url('/main.js', __FILE__), array('fuse', 'micromodal'));
    wp_enqueue_script('cbpr-main');

    wp_enqueue_style('main-aa-css', plugins_url('/main.css', __FILE__));
}
