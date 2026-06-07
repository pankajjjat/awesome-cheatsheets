# Python

* Python is an interpreted, high-level, general-purpose, dynamically typed programming language.
* Object-oriented, modular, and scripting language. Everything is an Object.
* Indentation-based (PEP 8), no braces.
* Supported on all major platforms. Runs on CPython (default), PyPy, Jython, etc.

---

## Running Python

```bash
python3 script.py              # Run a script
python3 -m venv .venv          # Create virtual environment (built-in)
python3 -m pip install <pkg>   # Install package (classic)
uv pip install <pkg>           # Install with uv (modern, 10-100x faster)
uv add <pkg>                   # uv: add dependency & sync
uv sync                        # uv: sync from pyproject.toml
python3 -c "print('hi')"       # Run inline code
python3 -i script.py           # Run script then enter interactive REPL
python3 -m http.server 8000    # Simple HTTP server
```

## Virtual Environments (Modern)

```bash
# Built-in (Python 3.3+)
python3 -m venv .venv
source .venv/bin/activate      # Linux/macOS
.venv\Scripts\activate          # Windows

# uv (modern, fast)
uv venv                        # Create .venv
uv venv --python 3.12         # Specific version
source .venv/bin/activate
uv sync                        # Install deps from pyproject.toml
```

## Package Management

```bash
pip install -U pip             # Upgrade pip
pip install <pkg>              # Install
pip install -r requirements.txt
pip freeze > requirements.txt
pip list --outdated
pip uninstall <pkg>

# Modern: pip-tools
pip-compile pyproject.toml     # Generate requirements.txt
pip-sync                       # Sync env to requirements.txt

# Modern: uv (replaces pip/pip-compile/pip-sync/venv)
uv add requests               # Add to pyproject.toml & install
uv add --dev pytest           # Dev dependency
uv remove requests
uv pip install flask          # Works like pip too
```

## Basic Datatypes

| Data Type | Description |
|-----------|------------|
| `int` | Integer [0, 1, -2, 3_000_000] |
| `float` | Floating point [0.1, 4.532, -5.092] |
| `str` | Strings ['abc', "def", f"val={x}"] |
| `bool` | Boolean [True, False] |
| `complex` | Complex numbers [2+3j, 4-1j] |
| `bytes` | Byte literals [b"hello"] |
| `bytearray` | Mutable bytes |
| `None` | Null value (`NoneType`) |

New in 3.10+: `str.removeprefix()`, `str.removesuffix()`, `int.bit_count()`

```python
s = "HelloWorld"
s.removeprefix("Hello")  # "World"  (new in 3.9)
s.removesuffix("World")  # "Hello"  (new in 3.9)
```

## Keywords (35+, Python 3.10+ added `match`, `case`, `_` soft keyword)

| Keyword | Category |
|---------|----------|
| `True` `False` `None` | Value keywords |
| `and` `or` `not` `in` `is` | Operator keywords |
| `if` `elif` `else` | Conditional |
| `for` `while` `break` `continue` | Iteration |
| `def` `class` `lambda` | Structure |
| `with` `as` | Context managers |
| `pass` | No-op placeholder |
| `return` `yield` | Returning |
| `import` `from` | Import system |
| `try` `except` `finally` `raise` `assert` | Exception handling |
| `async` `await` | Async programming |
| `del` `global` `nonlocal` | Variable handling |
| `match` `case` | Pattern matching (3.10+) |

## Type Hints (Modern Python)

```python
from collections.abc import Sequence, Mapping, Callable
from typing import TypeVar, Generic, overload, assert_never

# Basic
name: str = "Alice"
age: int

# Functions
def greet(name: str) -> str:
    return f"Hello {name}"

# Optional / Union (modern syntax 3.10+)
def lookup(key: str) -> str | None: ...     # Use | instead of Optional

# Union simplifications
x: int | str | float = 42

# TypeVar with bound (Python 3.12+ simplified syntax)
T = TypeVar("T", bound=float)

# 3.12+ TypeVar syntax
# type Vector[T: float] = list[T]

# ParamSpec for callbacks
from typing import ParamSpec, Concatenate
P = ParamSpec("P")

# Self type (3.11+)
from typing import Self

class MyClass:
    @classmethod
    def create(cls) -> Self: ...

# TypedDict (3.8+)
from typing import TypedDict

class User(TypedDict):
    name: str
    age: int

# Literal types
from typing import Literal

def set_mode(m: Literal["r", "w", "a"]) -> None: ...

# protocol (structural subtyping)
from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> None: ...
```

## Pattern Matching (`match`/`case` — Python 3.10+)

```python
# Basic match
def process(value: object) -> str:
    match value:
        case 0:
            return "zero"
        case 1 | 2:
            return "small"
        case int(n) if n > 100:   # Guard
            return "large"
        case str(s):
            return f"string: {s}"
        case _:                    # Wildcard (default)
            return "unknown"

# Matching sequences
match items:
    case []:
        print("empty")
    case [first]:
        print(f"single item: {first}")
    case [first, second]:
        print(f"two items")
    case [first, *rest]:
        print(f"first: {first}, rest: {rest}")

# Matching mappings
match config:
    case {"command": str(cmd), "args": list(args)}:
        run(cmd, *args)

# Matching objects
match point:
    case Point(x=0, y=0):
        print("origin")
    case Point(x=x, y=y):
        print(f"({x}, {y})")

# Matching with enum
from enum import Enum, auto

class Color(Enum):
    RED = auto()
    GREEN = auto()
    BLUE = auto()

match color:
    case Color.RED:
        print("red")
    case _:
        print("other")
```

## Walrus Operator (`:=`) — Python 3.8+

```python
# Assignment expression — assign within expression
if (n := len(a)) > 10:
    print(f"Too long: {n}")

# In list comprehensions
[y := x**2, y * 2 for x in range(10)]

# While loops
while (chunk := file.read(8192)):
    process(chunk)

# Regex matches
if (m := re.search(r"(\w+):(\d+)", line)):
    print(f"Name: {m[1]}, Value: {m[2]}")
```

## Data Structures

### List

```python
lst = [1, 2, 3]
lst.append(4)           # Add to end
lst.extend([5, 6])      # Extend
lst.insert(0, 0)        # Insert at index
lst.pop()               # Remove & return last
lst.pop(0)              # Remove & return at index
lst.remove(3)           # Remove first match
lst.sort()              # In-place sort
lst.reverse()           # In-place reverse
len(lst)                # Length
[x * 2 for x in lst]    # List comprehension
[x for x in lst if x > 2]
```

### Tuple

```python
t = (1, 2, 3)
t = 1, 2, 3            # Parens optional
t = (1,)               # Single-element tuple
x, y = (1, 2)          # Tuple unpacking
x, *rest = [1, 2, 3]   # Extended unpacking
```

### Set

```python
s = {1, 2, 3}
s.add(4)
s.remove(3)            # Raises KeyError if missing
s.discard(3)           # No error if missing
s.pop()                # Remove & return arbitrary element
a | b                  # Union
a & b                  # Intersection
a - b                  # Difference
a ^ b                  # Symmetric diff
{x for x in range(10)} # Set comprehension
frozenset({1, 2, 3})   # Immutable set
```

### Dictionary

```python
d = {"a": 1, "b": 2}
d["c"] = 3             # Set/update
d.get("d", 0)          # Safe get with default
d.setdefault("e", 5)   # Set if missing
d.pop("a")             # Remove & return
d.keys() | d.values() | d.items()  # Views
{k: v for k, v in d.items() if v > 1}
d1 | d2                # Merge (3.9+)
d1 |= d2               # In-place merge (3.9+)
```

## Control Flow

```python
# if/elif/else
if condition:
    ...
elif other_condition:
    ...
else:
    ...

# for loops
for item in iterable:
    pass

# with enumerate
for i, item in enumerate(iterable, start=1):
    print(f"{i}: {item}")

# with zip
for a, b in zip(list1, list2, strict=True):  # strict=True in 3.10+
    ...

# while
while condition:
    ...

# break/continue/pass — standard
```

## Comprehensions

```python
# List
[x**2 for x in range(10)]
[x**2 for x in range(10) if x % 2 == 0]
[expr for x in xs for y in ys]  # Nested

# Dict
{k: v for k, v in pairs if condition}

# Set
{x % 3 for x in range(100)}

# Generator (lazy)
(x**2 for x in range(10_000_000))
sum(x**2 for x in range(100))  # No extra parens needed
```

## Functions

```python
def func(pos, default=5, *args, key=None, **kwargs):
    """
    pos: positional
    default: optional with default
    *args: variable positional
    key: keyword-only (after *)
    **kwargs: variable keyword
    """
    return result

# Lambda
sq = lambda x: x**2

# Type hints
def func(x: int, y: str) -> bool:
    return True

# Decorators
@decorator
def func(): ...

# functools
from functools import wraps, lru_cache, partial, reduce

@lru_cache(maxsize=128)
def fib(n: int) -> int:
    return n if n < 2 else fib(n-1) + fib(n-2)

inc = partial(add, 1)   # Partial application
```

## Error Handling

```python
try:
    risky()
except ValueError as e:
    print(f"ValueError: {e}")
except (TypeError, RuntimeError):
    print("Type or Runtime error")
except Exception:
    print("Catch-all")  # Avoid bare except:
else:
    print("No error occurred")
finally:
    cleanup()

# raise / raise from
raise ValueError("msg")
raise RuntimeError("wrapped") from ValueError("cause")

# assert
assert x > 0, f"x must be positive, got {x}"

# Exception groups (3.11+)
try:
    raise ExceptionGroup("multiple", [ValueError("a"), TypeError("b")])
except* ValueError as e:
    print(f"Got ValueError(s): {e.exceptions}")
```

## Context Managers

```python
# with statement
with open("file.txt") as f:
    data = f.read()

# Multiple
with open("a.txt") as a, open("b.txt") as b:
    ...

# Parenthesized (3.10+)
with (
    open("a.txt") as a,
    open("b.txt") as b,
):
    ...

# Custom context manager
from contextlib import contextmanager

@contextmanager
def managed():
    print("enter")
    try:
        yield
    finally:
        print("exit")

# contextlib.suppress, contextlib.redirect_stdout
from contextlib import suppress
with suppress(FileNotFoundError):
    os.remove("maybe.txt")
```

## Async / Await (Modern)

```python
import asyncio

async def fetch(url: str) -> str:
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as resp:
            return await resp.text()

async def main():
    results = await asyncio.gather(
        fetch("https://api.example.com/a"),
        fetch("https://api.example.com/b"),
    )
    print(results)

asyncio.run(main())  # Python 3.7+ preferred

# Task groups (3.11+)
async def main():
    async with asyncio.TaskGroup() as tg:
        t1 = tg.create_task(fetch("a"))
        t2 = tg.create_task(fetch("b"))
    # All tasks done here, exceptions grouped

# Async iterators & context managers
class AsyncIterator:
    def __aiter__(self): return self
    async def __anext__(self): ...

class AsyncCM:
    async def __aenter__(self): ...
    async def __aexit__(self, *e): ...
```

## ZoneInfo (Python 3.9+) — Modern timezone handling

```python
from zoneinfo import ZoneInfo  # replaces pytz
from datetime import datetime, timezone

dt = datetime(2024, 1, 1, tzinfo=ZoneInfo("America/New_York"))
print(dt.tzname())  # 'EST'

# Convert
dt_utc = dt.astimezone(timezone.utc)
dt_paris = dt.astimezone(ZoneInfo("Europe/Paris"))
```

## Python 3.12+ Features

```python
# Improved error messages for NameError, ImportError, SyntaxError
# More helpful tracebacks, suggestions like "Did you mean 'x'?"

# Type parameter syntax (3.12)
# def max[T](a: T, b: T) -> T: ...
# class Stack[T]: ...

# Type statement (3.12)
# type Point = tuple[float, float]
# type Point[T] = tuple[T, T]

# F-strings improvements (3.12) — can use same quote as outer string
# f"{x}" — always worked, but f"{'hello'}" works in 3.12

# itertools.batched (3.12)
from itertools import batched
for batch in batched(range(10), 3):
    print(batch)  # (0,1,2) (3,4,5) (6,7,8) (9,)

# pathlib.walk (3.12)
# for entry in Path(".").walk(): ...

# Better soft keywords and comprehensions
```

## Standard Library Highlights

```python
import os, sys, json, re, math, statistics, datetime, pathlib
from pathlib import Path
from collections import Counter, defaultdict, deque, namedtuple
from itertools import chain, count, cycle, groupby, islice, product
from functools import reduce, partial, lru_cache, wraps
from dataclasses import dataclass, field
import sqlite3
import csv
import hashlib
import uuid
import subprocess

# dataclass (3.7+)
@dataclass
class Point:
    x: float
    y: float
    label: str = ""
    tags: list[str] = field(default_factory=list)

p = Point(1.0, 2.0, "origin")

# pathlib (modern fs)
Path("data/output.txt").write_text("hello")
data = Path("file.json").read_text()
for f in Path("src").glob("**/*.py"):
    ...

# subprocess (modern)
result = subprocess.run(["ls", "-la"], capture_output=True, text=True, check=True)
print(result.stdout)

# TOML support (3.11+)
import tomllib
with open("pyproject.toml", "rb") as f:
    config = tomllib.load(f)
```

## Common Idioms

```python
# Swap
a, b = b, a

# Unpacking
a, *middle, z = [1, 2, 3, 4, 5]

# Truthiness
if items:          # Not if len(items) > 0
if not items:

# Ternary
x = a if condition else b

# Chained comparisons
if 0 < x < 10:     # instead of x > 0 and x < 10

# Enumerate
for i, val in enumerate(lst):

# Zip (parallel iteration)
for a, b in zip(xs, ys, strict=True):  # strict= requires equal lengths

# dict.get with default
val = d.get("key", default)

# any/all
if any(x > 10 for x in lst):
if all(isinstance(x, int) for x in lst):

# Unpack dicts
{**d1, **d2}  # or d1 | d2 (3.9+)
