cmake_minimum_required(VERSION 3.22)

project(OpenGroove VERSION 0.1.0 LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(FetchContent)
FetchContent_Declare(
    juce
    GIT_REPOSITORY https://github.com/juce-framework/JUCE.git
    GIT_TAG        8.0.4
    GIT_SHALLOW    TRUE)
FetchContent_MakeAvailable(juce)

set(OPENGROOVE_FORMATS VST3 Standalone)
if(APPLE)
    list(APPEND OPENGROOVE_FORMATS AU)
endif()

juce_add_plugin(OpenGroove
    COMPANY_NAME                 "Erwan"
    PRODUCT_NAME                 "Open Groove"
    BUNDLE_ID                    "fr.erwan.opengroove"
    PLUGIN_MANUFACTURER_CODE     Ewan
    PLUGIN_CODE                  OpnG
    FORMATS                      ${OPENGROOVE_FORMATS}
    IS_SYNTH                     TRUE
    NEEDS_MIDI_INPUT             TRUE
    NEEDS_MIDI_OUTPUT            TRUE
    IS_MIDI_EFFECT               FALSE
    EDITOR_WANTS_KEYBOARD_FOCUS  TRUE
    NEEDS_WEBVIEW2               TRUE
    COPY_PLUGIN_AFTER_BUILD      FALSE
    VST3_CATEGORIES              Instrument Generator Drum)

juce_add_binary_data(OpenGrooveUI SOURCES ui/opengroove_ui.html)

target_sources(OpenGroove PRIVATE
    Source/PluginProcessor.cpp
    Source/PluginEditor.cpp
    Source/MidiExport.cpp)

target_compile_definitions(OpenGroove PUBLIC
    JUCE_WEB_BROWSER=1
    JUCE_USE_CURL=0
    JUCE_USE_WIN_WEBVIEW2_WITH_STATIC_LINKING=1
    JUCE_VST3_CAN_REPLACE_VST2=0
    JUCE_DISPLAY_SPLASH_SCREEN=0)

if(UNIX AND NOT APPLE)
    # build Linux : utile pour vérifier la compilation, la cible réelle est Windows/macOS
    target_link_libraries(OpenGroove PRIVATE juce::pkgconfig_JUCE_BROWSER_LINUX_DEPS)
endif()

target_link_libraries(OpenGroove
    PRIVATE
        OpenGrooveUI
        juce::juce_audio_utils
        juce::juce_gui_extra
    PUBLIC
        juce::juce_recommended_config_flags
        juce::juce_recommended_lto_flags
        juce::juce_recommended_warning_flags)
