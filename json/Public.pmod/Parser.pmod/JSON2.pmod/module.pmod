// vim:syntax=lpc
//! @ignore

constant __author = "Arne Goedeke <pike@laramies.com>";
constant __version = "1.0";
constant __components = ({ "Public.pmod/Parser.pmod/JSON2.pmod/module.pmod" });
//! @endignore
//! This module has been merged into Pike 7.8 and is not maintained anymore. 
//! The same functionality is now available in @[Standards.JSON]. This module 
//! uses Standards.JSON internally now. It is available only for those who 
//! do not want to update their code.

//! Objects representing the three JSON literals @expr{null@}, @expr{false@} 
//! and @expr{true@}. They should behave as exprected in boolean context.
object null = Standards.JSON.null;
object true = Standards.JSON.true;
object false = Standards.JSON.false;

string render(mixed o, void|int flag) {
    return Standards.JSON.encode(o, flag);
}

string render_utf8(mixed o, void|int flag) {
    return string_to_utf8(render(o, flag));
}

int validate(string data) { return Standards.JSON.validate(data); }
int validate_utf8(string data) { return Standards.JSON.validate_utf8(data); }

mixed parse(string data) { return Standards.JSON.decode(data); }
mixed parse_utf8(string data) { return Standards.JSON.decode_utf8(data); }

constant HUMAN_READABLE = Standards.JSON.HUMAN_READABLE;
constant ASCII_ONLY = Standards.JSON.ASCII_ONLY;
//! May be passed to @[render()] and @[render_utf8()] as a flag. Makes output 
//! readable by inserting spaces and newlines.
