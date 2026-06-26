import type { SceneNodeSpec, SceneSpec } from '../engine/types.ts'
import { columns, container, code, stack, type NodeSeed } from '../engine/patterns.ts'
import { BLUE, GREEN, ORANGE, PURPLE, TEAL, YELLOW } from '../engine/colors.ts'

// Scala by example, as a CHEAT-SHEET — the companion to `scala-anatomy.ts`. Where
// anatomy shows the grammar abstractly (token chips), this shows the SAME language
// as REAL, syntax-highlighted code. The SIX bands map 1:1 onto the scala-content
// language notebooks (02–09; 01 intro/setup is the `scala-jvm` scene's domain), so
// the manifest can `focus`/`highlight` the right card as a learner pages a notebook:
//
//   Values & Types  → 02-values-types-and-expressions
//   Functions       → 03-functions-and-methods
//   Collections     → 04-collections
//   OOP & ADTs       → 05-oop-classes-traits-case-classes-enums
//   Match & Effects → 06-pattern-matching-option-try-either  +  09-concurrency-and-error-handling
//   Generics & Givens → 07-generics-variance-advanced-types  +  08-givens-and-extensions
//
// Each band is FOUR `kind: 'code'` cards laid out HORIZONTALLY (columns), each with
// its OWN top-left title (no wrapping container) so it gets the full column width.
// Snippets are taken from the notebooks and kept ≤ ~44 cols so the columns don't wrap.

// A band: a titled row holding its code cards side by side (tight columns).
const band = (id: string, title: string, color: string, cards: NodeSeed[]): SceneNodeSpec =>
  container(
    { id, label: title, color },
    columns(
      cards.map((c) => [c]),
      { tight: true, gap: 0.08, padding: 0.12 },
    ),
    { padding: 0.1 },
  )

// ===== BAND 1: VALUES, TYPES & EXPRESSIONS — notebook 02 =====
const valuesTypes = band('sg-vt', 'Values, Types & Expressions  ·  nb 02', BLUE, [
  code(
    'sg-vt-val',
    'val pi = 3.14159        // immutable\nvar count = 0           // mutable\nlazy val conf = load()  // once, on read\nfinal val Max = 100',
    BLUE,
    'val · var · lazy val',
  ),
  code(
    'sg-vt-types',
    '// inferred, or write it explicitly\nval n = 42                 // : Int\nval xs: List[Int] = Nil\ntype Id = Long             // alias\nval x = (1: Long)          // ascription\n// Any > AnyVal/AnyRef > … > Nothing',
    BLUE,
    'types & inference',
  ),
  code(
    'sg-vt-str',
    'val w = "Ada"\ns"hi $w, ${w.length}"   // interpolate\nf"$pi%.2f"              // 3.14\nraw"a\\nb"               // no escapes',
    BLUE,
    'String interpolators',
  ),
  code(
    'sg-vt-expr',
    '// if / match / blocks all RETURN a value\nval s = if n > 0 then "+" else "-"\n// while is the ONE statement (Unit)\nwhile i < n do i += 1\n1 + 2     // == 1.+(2): operator = method',
    BLUE,
    'everything is an expression',
  ),
])

// ===== BAND 2: FUNCTIONS & METHODS — notebook 03 =====
const functions = band('sg-fn', 'Functions & Methods  ·  nb 03', GREEN, [
  code(
    'sg-fn-def',
    'def square(n: Int) = n * n\ndef add(a: Int, b: Int = 0) = a + b\nadd(b = 5, a = 1)       // named args\ndef sum(xs: Int*) = xs.sum  // varargs',
    GREEN,
    'def · default · varargs',
  ),
  code(
    'sg-fn-lambda',
    'val inc = (x: Int) => x + 1\nval f: Int => Int = _ + 1   // shorthand\nList(1, 2, 3).map(_ * 2)\nList(1, 2).foldLeft(0)(_ + _)',
    GREEN,
    'function values & lambda',
  ),
  code(
    'sg-fn-hof',
    'def twice(f: Int => Int) = f(f(0))\ntwice(inc)              // 2\n// by-name: the expression, not its value\ndef log(m: => String) = if on then m',
    GREEN,
    'higher-order · by-name',
  ),
  code(
    'sg-fn-curry',
    '// multiple parameter lists\ndef mul(a: Int)(b: Int) = a * b\nval triple = mul(3)     // partial app\ntriple(10)              // 30',
    GREEN,
    'currying & partial app',
  ),
])

// ===== BAND 3: COLLECTIONS — notebook 04 =====
const collections = band('sg-co', 'Collections  ·  nb 04', ORANGE, [
  code(
    'sg-co-shapes',
    'val l = List(1, 2, 3)   // linked\nval v = Vector(1, 2, 3) // indexed\nval s = Set(1, 2, 2)    // {1, 2}\nval m = Map("a" -> 1)\nval a = Array(1, 2, 3)  // mutable\nval t = (1, "a", true)  // tuple',
    ORANGE,
    'shapes',
  ),
  code(
    'sg-co-mff',
    'xs.map(_ * 2)\nxs.filter(_ > 2)\nxs.flatMap(n => List(n, -n))\n// for-yield desugars to these\nfor x <- xs if x > 0 yield x * x',
    ORANGE,
    'map · filter · flatMap',
  ),
  code(
    'sg-co-fold',
    'xs.foldLeft(0)(_ + _)   // sum\nxs.reduce(_ max _)\nxs.groupBy(_ % 2)       // Map[Int, List]\nxs.partition(_ > 2)',
    ORANGE,
    'fold · groupBy · slice',
  ),
  code(
    'sg-co-ops',
    'xs.sortBy(-_)\nxs.zip(ys)\nxs.takeWhile(_ < 3); xs.find(_ > 9)\nxs.exists(_ > 9); xs.forall(_ > 0)\nxs.collect { case x if x > 0 => x }',
    ORANGE,
    'sort · zip · collect',
  ),
])

// ===== BAND 4: OOP & ADTs — notebook 05 =====
const oop = band('sg-oop', 'OOP — Classes · Traits · Case · Enum  ·  nb 05', PURPLE, [
  code(
    'sg-oop-class',
    'class Dog(val n: String):\n  def bark() = println(n)\nval d = Dog("Rex")\n// companion = same-name object\nobject Dog:\n  def stray = Dog("?")',
    PURPLE,
    'class · object · companion',
  ),
  code(
    'sg-oop-trait',
    'trait Walker:\n  def walk(): Unit        // abstract\ntrait Swimmer:\n  def swim() = ???        // default\n// mix in with `extends A, B` (linearized)\nclass Duck extends Walker, Swimmer:\n  def walk() = ()',
    PURPLE,
    'trait · linearization',
  ),
  code(
    'sg-oop-case',
    'case class Point(x: Int, y: Int)\nval p = Point(1, 2)\nval p2 = p.copy(y = 9)  // immutable update\np == Point(1, 2)        // structural ==\ncase object Origin',
    PURPLE,
    'case class · copy',
  ),
  code(
    'sg-oop-enum',
    'enum Color:\n  case Red, Green, Blue\n\nenum Tree[+A]:           // generic ADT\n  case Leaf(a: A)\n  case Node(l: Tree[A], r: Tree[A])',
    PURPLE,
    'enum  (ADT, Scala 3)',
  ),
])

// ===== BAND 5: PATTERN MATCHING & EFFECTS — notebooks 06 + 09 =====
const matchEffects = band('sg-pm', 'Pattern Match · Option/Try/Either · Future  ·  nb 06 + 09', TEAL, [
  code(
    'sg-pm-match',
    'x match\n  case 0          => "zero"   // literal\n  case n if n > 9 => "big"    // guard\n  case (a, b)     => a + b    // tuple\n  case Point(x,_) => x        // constructor\n  case h :: t     => h        // sequence\n  case _          => "other"  // wildcard',
    TEAL,
    'match — pattern kinds',
  ),
  code(
    'sg-pm-typed',
    'val o: Option[Int] = Some(3)\no.map(_ + 1).getOrElse(0)\nTry(parse(s))           // Success | Failure\nval e: Either[String, Int] = Right(1)\nfor a <- o; b <- o yield a + b',
    TEAL,
    'Option · Try · Either',
  ),
  code(
    'sg-pm-future',
    'import scala.concurrent.*\nimport ExecutionContext.Implicits.global\nval f = Future { heavy() }\nf.map(use).recover { case _ => 0 }\nfor a <- fa; b <- fb yield a + b',
    TEAL,
    'concurrency — Future',
  ),
  code(
    'sg-pm-try',
    'try parse(s)\ncatch case e: Exception => 0\nfinally close()\n// Using auto-closes an AutoCloseable\nUsing(Source.fromFile(p)):\n  _.getLines.toList',
    TEAL,
    'try / catch · Using',
  ),
])

// ===== BAND 6: GENERICS & GIVENS — notebooks 07 + 08 =====
const generics = band('sg-gx', 'Generics · Variance · Givens · Extensions  ·  nb 07 + 08', YELLOW, [
  code(
    'sg-gx-generics',
    'def identity[A](x: A): A = x\nclass Box[A](val value: A)\n// upper bound: A must be a subtype\ndef announce[A <: Named](a: A) = a.name',
    YELLOW,
    'generics & bounds',
  ),
  code(
    'sg-gx-variance',
    'class Box[+A](val value: A)   // covariant\nval b: Box[Animal] = Box[Dog](d)  // ok\n// +A produces, -A consumes\n// Function1[-A, +B]',
    YELLOW,
    'variance',
  ),
  code(
    'sg-gx-given',
    'trait Show[A]:\n  def show(a: A): String\ngiven Show[Int] with\n  def show(n: Int) = s"int($n)"\ndef p[A: Show](a: A) =      // context bound\n  summon[Show[A]].show(a)',
    YELLOW,
    'given / using · type class',
  ),
  code(
    'sg-gx-ext',
    'extension (s: String)\n  def shout = s.toUpperCase + "!"\n"hi".shout                  // "HI!"\n// union | and intersection &\ndef id(x: Int | String) = x\ndef name(p: Named & Aged) = p.name',
    YELLOW,
    'extensions · A | B · A & B',
  ),
])

// Six bands stacked top→down; `rows` ≈ each band's tallest card so the row is sized
// to its code. cols:1 so each band fills the width; SMALL padding so the bands use
// the full canvas (padding is in track-widths — large values waste width).
const layout = stack(
  [
    { node: valuesTypes, rows: 6 },
    { node: functions, rows: 5 },
    { node: collections, rows: 6 },
    { node: oop, rows: 7 },
    { node: matchEffects, rows: 7 },
    { node: generics, rows: 6 },
  ],
  { cols: 1, gap: 0.2, padding: 0.06 },
)

export const scalaGrammar: SceneSpec = {
  id: 'scala-grammar',
  topic: 'scala',
  title: 'Scala — by Example',
  subtitle: 'One band per language notebook (02–09) — real, syntax-highlighted code',
  // Wide (four code columns per band) and tall (six stacked bands of dense code).
  canvas: { width: 2200, height: 2150 },
  ...layout,
  edges: [
    { from: 'sg-vt', to: 'sg-fn' },
    { from: 'sg-fn', to: 'sg-co' },
    { from: 'sg-co', to: 'sg-oop' },
    { from: 'sg-oop', to: 'sg-pm' },
    { from: 'sg-pm', to: 'sg-gx' },
  ],
}
