use std::sync::Arc;
use wasm_bindgen::prelude::*;
use resvg::usvg::{fontdb, ImageRendering, ShapeRendering, TextRendering, TreeParsing, TreeTextToPath};

static FONT_GEN_BITMAP: &[u8] = include_bytes!("./fonts/GenBitmap.ttf");
static FONT_JISKAN24: &[u8] = include_bytes!("./fonts/xf_jiskan_new.ttf");
static FONT_ENGLISH_BITMAP: &[u8] = include_bytes!("./fonts/LedEnglishBitmap.ttf");

#[wasm_bindgen]
pub fn svg_to_png(svg: &str) -> Vec<u8> {
    let rtree = {
        let mut opt = resvg::usvg::Options::default();
        opt.image_rendering = ImageRendering::OptimizeSpeed;
        opt.text_rendering = TextRendering::OptimizeSpeed;
        opt.shape_rendering = ShapeRendering::OptimizeSpeed;

        let mut fontdb = fontdb::Database::new();
        fontdb.load_system_fonts();
        fontdb.load_font_source(fontdb::Source::Binary(Arc::new(FONT_GEN_BITMAP)));
        fontdb.load_font_source(fontdb::Source::Binary(Arc::new(FONT_ENGLISH_BITMAP)));
        fontdb.load_font_source(fontdb::Source::Binary(Arc::new(FONT_JISKAN24)));
        let mut tree = resvg::usvg::Tree::from_data(svg.as_bytes(), &opt).unwrap();
        tree.convert_text(&fontdb);
        resvg::Tree::from_usvg(&tree)
    };
    let pixmap_size = rtree.size.to_int_size();
    let mut pixmap = resvg::tiny_skia::Pixmap::new(pixmap_size.width(), pixmap_size.height()).unwrap_throw();
    rtree.render(resvg::tiny_skia::Transform::default(), &mut pixmap.as_mut());
    pixmap.encode_png().unwrap_throw()
}