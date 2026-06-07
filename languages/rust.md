# Rust — Cheatsheet

*Rust is a systems programming language focused on safety, speed, and concurrency.
Zero-cost abstractions, guaranteed memory safety, fearless concurrency.*

---

## Installation & Setup

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh   # Install rustup
rustup update                               # Update Rust toolchain
rustup self uninstall                       # Remove Rust
rustc --version                             # Rust compiler version
cargo --version                             # Cargo package manager
rustup doc --std                            # Open local std docs
```

### Toolchains & Targets

```bash
rustup toolchain list                       # Installed toolchains
rustup default stable                       # Set default
rustup install nightly                      # Install nightly
rustup target list                          # List supported targets
rustup target add wasm32-unknown-unknown    # Add WASM target
rustup target add aarch64-unknown-linux-gnu # Add ARM64 target
```

## Cargo Commands

```bash
cargo new my_project                        # Create new binary crate
cargo new --lib my_lib                      # Create new library crate
cargo init                                  # Init in existing dir
cargo build                                 # Build (debug)
cargo build --release                       # Build (optimized)
cargo check                                 # Check without compiling (fast)
cargo run                                   # Build + run
cargo test                                  # Run tests
cargo test -- --nocapture                   # Run tests with stdout shown
cargo test --test integration_test          # Run specific integration test
cargo bench                                 # Run benchmarks (nightly)
cargo doc                                   # Generate docs (target/doc/)
cargo doc --open                            # Generate + open docs
cargo publish                               # Publish to crates.io
cargo update                                # Update dependencies
cargo clean                                 # Remove target/ directory
cargo clippy                                # Lint (best practices)
cargo fmt                                   # Format code (rustfmt)
cargo fix                                   # Auto-fix warnings/edition changes
cargo audit                                 # Check for security vulnerabilities
cargo add serde                             # Add dependency (Cargo 1.62+)
cargo add --dev rstest                      # Add dev dependency
cargo remove serde                          # Remove dependency
cargo tree                                  # Show dependency tree
cargo outdated                              # Show outdated deps
cargo expand                                # Expand macros (requires cargo-expand)
```

## Cargo.toml

```toml
[package]
name = "my_project"
version = "0.1.0"
edition = "2021"               # 2015, 2018, or 2021
description = "A cool project"
authors = ["Your Name <email@example.com>"]
license = "MIT"
repository = "https://github.com/user/repo"

[dependencies]
serde = { version = "1", features = ["derive"] }
reqwest = { version = "0.12", features = ["json"] }
tokio = { version = "1", features = ["full"] }

[dev-dependencies]
rstest = "0.18"

[build-dependencies]
# Dependencies for build.rs only

[features]
default = ["std"]
std = []

[profile.release]
opt-level = 3              # Optimization level (0-3, s, z)
lto = true                  # Link-time optimization
codegen-units = 1           # Better optimization (slower build)
```

## Basic Syntax

```rust
// Comments
/// Doc comment (generates docs)
//! Inner doc comment (for crate/module level)

// Print
println!("Hello, world!");            // With newline
print!("No newline");                  // Without newline
eprintln!("Error: {}", msg);           // stderr

// Variables (immutable by default)
let x = 5;                            // Immutable
let mut y = 10;                        // Mutable
y += 5;

// Constants & statics
const MAX_POINTS: u32 = 100_000;      // Compile-time, no fixed address
static APP_NAME: &str = "MyApp";      // Fixed address, mutable requires unsafe

// Shadowing
let x = 5;
let x = x + 1;                        // Shadows previous x

// Type annotations
let num: u32 = "42".parse().expect("Not a number");
let guess: i32 = 10;
```

## Data Types

### Primitives

```rust
// Scalar types
let i: i32 = -10;             // i8, i16, i32, i64, i128, isize
let u: u32 = 10;              // u8, u16, u32, u64, u128, usize
let f: f64 = 3.14;            // f32, f64
let b: bool = true;
let c: char = 'z';            // Unicode (4 bytes)
let t: () = ();               // Unit type (empty tuple)

// Compound types
let tup: (i32, f64, &str) = (500, 6.4, "hello");
let (x, y, z) = tup;                     // Destructuring
let first = tup.0;                       // Index access

let arr: [i32; 3] = [1, 2, 3];          // Fixed size array
let slice: &[i32] = &arr[1..3];          // Slice (borrow)
```

### Strings

```rust
// &str — string slice (UTF-8, immutable borrow)
let s: &str = "hello";                   // String literal (&'static str)
let slice: &str = &greeting[0..5];       // Slice of String

// String — heap-allocated, growable, UTF-8
let mut s: String = String::from("hello");
s.push_str(" world");                    // Append &str
s.push('!');                             // Append char
s += "!!";                               // Concat
let len = s.len();                       // Byte length (not char count)

// Formatting
let formatted = format!("{}-{}", a, b);

// Conversion
let s = "42".to_string();
let n: i32 = "42".parse().unwrap();
let s = value.to_string();
```

### Vectors

```rust
let mut v: Vec<i32> = Vec::new();
v.push(1);
v.push(2);
let last = v.pop();                 // Some(2)
let first = v[0];                   // Indexing (panics if out of bounds)

let v = vec![1, 2, 3, 4, 5];       // Macro

// Iteration
for i in &v { println!("{i}"); }
for i in &mut v { *i += 1; }

// Common methods
v.len();
v.is_empty();
v.contains(&1);
v.sort();
v.reverse();
v.iter().map(|x| x * 2).collect::<Vec<_>>();
```

### HashMap

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Red"), 50);

// Entry API
scores.entry(String::from("Blue")).or_insert(0);
scores.entry(String::from("Green")).or_insert_with(|| 99);

// Access
let score = scores.get("Blue");              // Option<&i32>
for (key, value) in &scores { ... }
```

## Ownership & Borrowing

```rust
// Ownership rules:
// 1. Each value has one owner
// 2. Only one owner at a time
// 3. When owner goes out of scope, value is dropped

let s1 = String::from("hello");
let s2 = s1;                  // MOVED: s1 is invalid now
// println!("{}", s1);        // Error! borrow of moved value

let s1 = String::from("hello");
let s2 = s1.clone();          // Deep copy (heap too)
println!("{s1}, {s2}");       // Both valid

// Copy types (stored on stack — always copied, not moved)
// i32, u32, f64, bool, char, tuples of Copy types
let x = 5;
let y = x;                    // Copy, x still valid

// Borrowing (& reference — immutable)
fn calculate_length(s: &String) -> usize {  // Borrow, not take ownership
    s.len()
}
let s1 = String::from("hello");
let len = calculate_length(&s1);
println!("{s1} is {len} long");   // s1 still valid

// Mutable borrow (&mut — one at a time)
fn change(s: &mut String) {
    s.push_str(" world");
}
let mut s = String::from("hello");
change(&mut s);

// Rules:
// - Many immutable borrows OR one mutable borrow (not both)
// - References must always be valid (no dangling pointers)
```

## Slices

```rust
let arr = [1, 2, 3, 4, 5];
let slice = &arr[1..3];              // [2, 3]
let slice = &arr[..];                // All elements
let slice = &arr[2..];               // From index 2
let slice = &arr[..3];               // Up to index 3

let s = String::from("hello world");
let hello = &s[0..5];                // "hello"
let world = &s[6..11];               // "world"

// Function taking string slice
fn first_word(s: &str) -> &str {     // &str accepts both &String and &str
    s.split_whitespace().next().unwrap_or("")
}
```

## Structs

```rust
// Define
struct User {
    username: String,
    email: String,
    sign_in_count: u64,
    active: bool,
}

// Instantiate
let user1 = User {
    email: String::from("alice@example.com"),
    username: String::from("alice"),
    active: true,
    sign_in_count: 1,
};

// Field init shorthand
fn build_user(email: String, username: String) -> User {
    User {
        email,       // Shorthand (same as email: email)
        username,
        active: true,
        sign_in_count: 1,
    }
}

// Struct update syntax
let user2 = User {
    email: String::from("bob@example.com"),
    ..user1          // Remaining fields from user1
};

// Tuple structs
struct Color(i32, i32, i32);
let black = Color(0, 0, 0);

// Unit-like struct (no fields)
struct AlwaysEqual;

// Methods
impl User {
    fn is_active(&self) -> bool {
        self.active
    }
}

// Associated functions (no self)
impl User {
    fn new(email: String) -> User {
        User { email, username: email, active: true, sign_in_count: 1 }
    }
}
let user = User::new("a@b.com".into());
```

## Enums & Pattern Matching

```rust
enum IpAddr {
    V4(u8, u8, u8, u8),
    V6(String),
}

let home = IpAddr::V4(127, 0, 0, 1);
let loopback = IpAddr::V6(String::from("::1"));

// Methods on enums
impl IpAddr {
    fn call(&self) { ... }
}

// Option enum (in std, no need to import)
// enum Option<T> { None, Some(T) }
let some_num = Some(5);
let some_str = Some("hello");
let absent: Option<i32> = None;

// Result enum (in std)
// enum Result<T, E> { Ok(T), Err(E) }

// match
match some_num {
    Some(5) => println!("five"),
    Some(n) => println!("{n}"),
    None => println!("none"),
}

// if let — concise match for one pattern
if let Some(5) = some_num {
    println!("five");
}

// while let
let mut stack = vec![1, 2, 3];
while let Some(top) = stack.pop() {
    println!("{top}");
}

// let-else (return/break/panic if pattern doesn't match)
let Some(n) = some_num else {
    return;
};
```

## Traits

```rust
// Define
trait Greeter {
    fn greet(&self) -> String;
    fn default_greet(&self) -> String {   // Default implementation
        String::from("Hello!")
    }
}

// Implement
struct Person { name: String }

impl Greeter for Person {
    fn greet(&self) -> String {
        format!("Hi, I'm {}", self.name)
    }
}

// Traits as parameters
fn greet_person(item: &impl Greeter) {   // Impl Trait syntax
    println!("{}", item.greet());
}

fn greet_person2<T: Greeter>(item: &T) {  // Generic with trait bound
    println!("{}", item.greet());
}

// Multiple trait bounds
fn foo(item: &(impl Greeter + Display)) { ... }
fn bar<T: Greeter + Display>(item: &T) { ... }

// where clause
fn foo<T, U>(a: &T, b: &U) where T: Greeter + Display, U: Clone { ... }

// Trait objects (dynamic dispatch)
let greeter: Box<dyn Greeter> = Box::new(Person { name: "Alice".into() });

// Derive macros (auto-implement traits)
#[derive(Debug, Clone, PartialEq, Eq, Hash, Default)]
struct Point { x: i32, y: i32 }
```

## Error Handling

```rust
// Result
use std::fs::File;
use std::io::ErrorKind;

let f = File::open("hello.txt");
let f = match f {
    Ok(file) => file,
    Err(error) => match error.kind() {
        ErrorKind::NotFound => match File::create("hello.txt") {
            Ok(fc) => fc,
            Err(e) => panic!("Problem creating: {e:?}"),
        },
        other => panic!("Problem opening: {other:?}"),
    },
};

// Unwrap & Expect
let f = File::open("hello.txt").unwrap();       // Panics on error
let f = File::open("hello.txt").expect("msg");  // Panics with custom msg

// The ? operator (propagate error)
fn read_file(path: &str) -> Result<String, io::Error> {
    let mut f = File::open(path)?;        // Returns Err on error
    let mut s = String::new();
    f.read_to_string(&mut s)?;
    Ok(s)
}

// Chaining ? in main with Box<dyn Error>
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let f = File::open("hello.txt")?;
    Ok(())
}

// Option with ?
fn first_char(s: &str) -> Option<char> {
    s.chars().next()?
}

// Custom error types
#[derive(Debug)]
enum MyError {
    Io(std::io::Error),
    Parse(std::num::ParseIntError),
}

impl From<std::io::Error> for MyError {      // Enables ? with io errors
    fn from(e: std::io::Error) -> MyError { MyError::Io(e) }
}

// anyhow (popular crate for application errors)
// use anyhow::{Result, Context};
// fn do_stuff() -> Result<()> {
//     let f = File::open("file.txt").with_context(|| "Failed to open file")?;
//     Ok(())
// }

// thiserror (for library error types)
// #[derive(thiserror::Error, Debug)]
// pub enum MyError {
//     #[error("IO error: {0}")]
//     Io(#[from] std::io::Error),
// }
```

## Generics

```rust
fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut largest = &list[0];
    for item in list {
        if item > largest {
            largest = item;
        }
    }
    largest
}

struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn x(&self) -> &T { &self.x }
}

// Const generics
fn array_display<T: std::fmt::Debug, const N: usize>(arr: [T; N]) {
    println!("{arr:?}");
}
```

## Lifetimes

```rust
// Lifetime annotations — every reference has a lifetime
// 'a is a generic lifetime parameter

fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

// Lifetime elision rules (compiler infers most cases)

// Struct with reference
struct Excerpt<'a> {
    part: &'a str,
}

// Static lifetime — lives entire program
let s: &'static str = "I live forever";

// Lifetime bounds
fn func<'a, T: 'a>(t: &'a T) {}  // T must live at least as long as 'a
```

## Iterators & Closures

```rust
// Closures
let add_one = |x: u32| -> u32 { x + 1 };
let add_one = |x| x + 1;                        // Type inference
let result = add_one(5);

// Capturing (Fn, FnMut, FnOnce)
let x = 10;
let equal = |z| z == x;           // Fn: borrows immutably
let mut list = vec![1, 2, 3];
let mut borrow_mut = || list.push(4);  // FnMut: borrows mutably
let consume = || drop(list);      // FnOnce: takes ownership

// Iterator trait
let v: Vec<_> = (0..10).collect();
let sum: i32 = v.iter().sum();
let evens: Vec<_> = v.iter().filter(|x| *x % 2 == 0).collect();
let doubled: Vec<_> = v.iter().map(|x| x * 2).collect();
let any_greater = v.iter().any(|x| *x > 5);
let all_small = v.iter().all(|x| *x < 20);
let first = v.iter().find(|&&x| x == 5);
let reduced = v.iter().fold(0, |acc, x| acc + x);
```

## Async / Await

```rust
// Requires async runtime (tokio, async-std, smol)
// Cargo.toml: tokio = { version = "1", features = ["full"] }

use tokio;

#[tokio::main]                                               // Runtime entry point
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let result = fetch_data().await?;
    println!("{result}");
    Ok(())
}

async fn fetch_data() -> Result<String, reqwest::Error> {
    let resp = reqwest::get("https://api.example.com").await?;
    let body = resp.text().await?;
    Ok(body)
}

// Concurrent execution
async fn concurrent() {
    let (r1, r2) = tokio::join!(task1(), task2());          // Both complete
}

// Select — wait for first completion
use tokio::select;

async fn select_example() {
    select! {
        result = op1() => println!("op1: {result}"),
        result = op2() => println!("op2: {result}"),
    }
}

// Tokio spawn
tokio::spawn(async {
    // Runs in background on thread pool
});

// Channels
let (tx, mut rx) = tokio::sync::mpsc::channel(32);
tokio::spawn(async move {
    tx.send("hello").await.unwrap();
});
```

## Common Crates

| Crate | Purpose |
|-------|---------|
| `serde` / `serde_json` | Serialization/Deserialization |
| `tokio` | Async runtime |
| `reqwest` | HTTP client |
| `axum` / `actix-web` | Web frameworks |
| `clap` | CLI argument parsing |
| `tracing` | Logging & diagnostics |
| `anyhow` / `thiserror` | Error handling |
| `chrono` | Date/time |
| `sqlx` | Database (async SQL) |
| `diesel` | ORM |
| `rand` | Random number generation |
| `regex` | Regular expressions |
| `rayon` | Parallel iterators |
| `rustls` | TLS (rustls over openssl) |
| `wasm-bindgen` | WASM interop |

## Testing

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }

    #[test]
    fn with_result() -> Result<(), String> {
        if 2 + 2 == 4 { Ok(()) } else { Err("nope".into()) }
    }

    #[test]
    #[should_panic(expected = "panic message")]
    fn panics() {
        panic!("panic message");
    }

    #[test]
    #[ignore]
    fn expensive() { ... }

    // With rstest crate
    // use rstest::rstest;
    // #[rstest]
    // #[case(1, 2, 3)]
    // #[case(0, 0, 0)]
    // fn add_test(#[case] a: i32, #[case] b: i32, #[case] expected: i32) {
    //     assert_eq!(add(a, b), expected);
    // }
}
```

## Project Layout

```
src/
├── main.rs            # Binary entry point
├── lib.rs             # Library root (for lib crates)
├── bin/
│   └── other-bin.rs   # Additional binaries
└── modules/
    ├── mod.rs
    └── submodule.rs
tests/                 # Integration tests
benches/               # Benchmarks
examples/              # Example programs
```
