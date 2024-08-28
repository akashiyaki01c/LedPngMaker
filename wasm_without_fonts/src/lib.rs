use base64::Engine;
use wasm_bindgen::prelude::*;
use resvg::usvg::{fontdb, ImageRendering, ShapeRendering, TextRendering, TreeParsing, TreeTextToPath};

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn svg_to_png(svg: &str, base64ed_fonts: &str) -> Vec<u8> {
    let fonts_bytes = get_font_bytes(base64ed_fonts);

    let rtree = {
        let mut opt = resvg::usvg::Options::default();
        opt.image_rendering = ImageRendering::OptimizeSpeed;
        opt.text_rendering = TextRendering::OptimizeSpeed;
        opt.shape_rendering = ShapeRendering::OptimizeSpeed;

        let mut fontdb = fontdb::Database::new();
        for font in fonts_bytes {
            fontdb.load_font_data(font);
        }
        for face in fontdb.faces() {
            log(&format!("Face Info: {:?}", face.families));
        }
        let mut tree = resvg::usvg::Tree::from_data(svg.as_bytes(), &opt).unwrap();
        tree.convert_text(&fontdb);
        resvg::Tree::from_usvg(&tree)
    };
    let pixmap_size = rtree.size.to_int_size();
    let mut pixmap = resvg::tiny_skia::Pixmap::new(pixmap_size.width(), pixmap_size.height()).unwrap_throw();
    rtree.render(resvg::tiny_skia::Transform::default(), &mut pixmap.as_mut());
    pixmap.encode_png().unwrap_throw()
}

fn get_font_bytes(str: &str) -> Vec<Vec<u8>> {
    let mut result: Vec<Vec<u8>> = vec![];
    for base64ed_font in str.split(';') {
        match base64::engine::general_purpose::STANDARD.decode(base64ed_font) {
            Ok(v) => {
                result.push(v);
            }
            Err(v) => {
                log(&format!("Base64 DecodeError: {:?}", v));
            }
        }
    }
    result
}