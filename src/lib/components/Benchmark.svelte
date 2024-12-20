<script lang="ts">
    import { onMount, onDestroy } from 'svelte'
    let count = $state(0)

    let i: number
    onMount(() => {
        i = setInterval(() => {
            count++
        }, 100)
    })
    onDestroy(() => {
        clearInterval(i)
    })

    class State {
        a = $derived(count * 2)
        b = $derived(this.a * 2)
        c = $derived(this.b / 3)
        d = $derived(this.c * 4)
        e = $derived(this.d / 5)
        f = $derived(this.e * 6)
        g = $derived(this.f / 7)
        h = $derived(this.g * 8)
        i = $derived(this.h / 9)
        j = $derived(this.i * 10)
        k = $derived(this.j / 11)
        l = $derived(this.k * 10)
        m = $derived(this.l / 13)
        n = $derived(this.m * 10)
        o = $derived(this.n / 15)
        p = $derived(this.o * 20)
        q = $derived(this.p / 17)
        r = $derived(this.q * 20)
        s = $derived(this.r / 19)
        t = $derived(this.s * 30)
        u = $derived(this.t / 21)
        v = $derived(this.u * 30)
        w = $derived(this.v / 23)
        x = $derived(this.w * 22)
        y = $derived(this.x / 25)
        z = $derived(this.y * 10)
    }

    const s = new State()
</script>

<button onclick={() => count++}>Increment</button>
{count}
<br />
{Math.floor(s.a)}
{Math.floor(s.b)}
{Math.floor(s.c)}
{Math.floor(s.d)}
{Math.floor(s.e)}
{Math.floor(s.f)}
{Math.floor(s.g)}
{Math.floor(s.h)}
{Math.floor(s.i)}
{Math.floor(s.j)}
{Math.floor(s.k)}
{Math.floor(s.l)}
{Math.floor(s.m)}
{Math.floor(s.n)}
{Math.floor(s.o)}
{Math.floor(s.p)}
{Math.floor(s.q)}
{Math.floor(s.r)}
{Math.floor(s.s)}
{Math.floor(s.t)}
{Math.floor(s.u)}
{Math.floor(s.v)}
{Math.floor(s.w)}
{Math.floor(s.x)}
{Math.floor(s.y)}
{Math.floor(s.z)}
<br />
{Math.floor(s.a)}
{Math.floor(s.b)}
{Math.floor(s.c)}
{Math.floor(s.d)}
{Math.floor(s.e)}
{Math.floor(s.f)}
{Math.floor(s.g)}
{Math.floor(s.h)}
{Math.floor(s.i)}
{Math.floor(s.j)}
{Math.floor(s.k)}
{Math.floor(s.l)}
{Math.floor(s.m)}
{Math.floor(s.n)}
{Math.floor(s.o)}
{Math.floor(s.p)}
{Math.floor(s.q)}
{Math.floor(s.r)}
{Math.floor(s.s)}
{Math.floor(s.t)}
{Math.floor(s.u)}
{Math.floor(s.v)}
{Math.floor(s.w)}
{Math.floor(s.x)}
{Math.floor(s.y)}
{Math.floor(s.z)}
<br />
{Math.floor(s.a)}
{Math.floor(s.b)}
{Math.floor(s.c)}
{Math.floor(s.d)}
{Math.floor(s.e)}
{Math.floor(s.f)}
{Math.floor(s.g)}
{Math.floor(s.h)}
{Math.floor(s.i)}
{Math.floor(s.j)}
{Math.floor(s.k)}
{Math.floor(s.l)}
{Math.floor(s.m)}
{Math.floor(s.n)}
{Math.floor(s.o)}
{Math.floor(s.p)}
{Math.floor(s.q)}
{Math.floor(s.r)}
{Math.floor(s.s)}
{Math.floor(s.t)}
{Math.floor(s.u)}
{Math.floor(s.v)}
{Math.floor(s.w)}
{Math.floor(s.x)}
{Math.floor(s.y)}
{Math.floor(s.z)}
<br />
{Math.floor(s.a)}
{Math.floor(s.b)}
{Math.floor(s.c)}
{Math.floor(s.d)}
{Math.floor(s.e)}
{Math.floor(s.f)}
{Math.floor(s.g)}
{Math.floor(s.h)}
{Math.floor(s.i)}
{Math.floor(s.j)}
{Math.floor(s.k)}
{Math.floor(s.l)}
{Math.floor(s.m)}
{Math.floor(s.n)}
{Math.floor(s.o)}
{Math.floor(s.p)}
{Math.floor(s.q)}
{Math.floor(s.r)}
{Math.floor(s.s)}
{Math.floor(s.t)}
{Math.floor(s.u)}
{Math.floor(s.v)}
{Math.floor(s.w)}
{Math.floor(s.x)}
{Math.floor(s.y)}
{Math.floor(s.z)}
<br />
{Math.floor(s.a)}
{Math.floor(s.b)}
{Math.floor(s.c)}
{Math.floor(s.d)}
{Math.floor(s.e)}
{Math.floor(s.f)}
{Math.floor(s.g)}
{Math.floor(s.h)}
{Math.floor(s.i)}
{Math.floor(s.j)}
{Math.floor(s.k)}
{Math.floor(s.l)}
{Math.floor(s.m)}
{Math.floor(s.n)}
{Math.floor(s.o)}
{Math.floor(s.p)}
{Math.floor(s.q)}
{Math.floor(s.r)}
{Math.floor(s.s)}
{Math.floor(s.t)}
{Math.floor(s.u)}
{Math.floor(s.v)}
{Math.floor(s.w)}
{Math.floor(s.x)}
{Math.floor(s.y)}
{Math.floor(s.z)}

<br />
{Math.floor(s.a)}
{Math.floor(s.b)}
{Math.floor(s.c)}
{Math.floor(s.d)}
{Math.floor(s.e)}
{Math.floor(s.f)}
{Math.floor(s.g)}
{Math.floor(s.h)}
{Math.floor(s.i)}
{Math.floor(s.j)}
{Math.floor(s.k)}
{Math.floor(s.l)}
{Math.floor(s.m)}
{Math.floor(s.n)}
{Math.floor(s.o)}
{Math.floor(s.p)}
{Math.floor(s.q)}
{Math.floor(s.r)}
{Math.floor(s.s)}
{Math.floor(s.t)}
{Math.floor(s.u)}
{Math.floor(s.v)}
{Math.floor(s.w)}
{Math.floor(s.x)}
{Math.floor(s.y)}
{Math.floor(s.z)}

<br />
{Math.floor(s.a)}
{Math.floor(s.b)}
{Math.floor(s.c)}
{Math.floor(s.d)}
{Math.floor(s.e)}
{Math.floor(s.f)}
{Math.floor(s.g)}
{Math.floor(s.h)}
{Math.floor(s.i)}
{Math.floor(s.j)}
{Math.floor(s.k)}
{Math.floor(s.l)}
{Math.floor(s.m)}
{Math.floor(s.n)}
{Math.floor(s.o)}
{Math.floor(s.p)}
{Math.floor(s.q)}
{Math.floor(s.r)}
{Math.floor(s.s)}
{Math.floor(s.t)}
{Math.floor(s.u)}
{Math.floor(s.v)}
{Math.floor(s.w)}
{Math.floor(s.x)}
{Math.floor(s.y)}
{Math.floor(s.z)}

<br />
{Math.floor(s.a)}
{Math.floor(s.b)}
{Math.floor(s.c)}
{Math.floor(s.d)}
{Math.floor(s.e)}
{Math.floor(s.f)}
{Math.floor(s.g)}
{Math.floor(s.h)}
{Math.floor(s.i)}
{Math.floor(s.j)}
{Math.floor(s.k)}
{Math.floor(s.l)}
{Math.floor(s.m)}
{Math.floor(s.n)}
{Math.floor(s.o)}
{Math.floor(s.p)}
{Math.floor(s.q)}
{Math.floor(s.r)}
{Math.floor(s.s)}
{Math.floor(s.t)}
{Math.floor(s.u)}
{Math.floor(s.v)}
{Math.floor(s.w)}
{Math.floor(s.x)}
{Math.floor(s.y)}
{Math.floor(s.z)}

<br />
{Math.floor(s.a)}
{Math.floor(s.b)}
{Math.floor(s.c)}
{Math.floor(s.d)}
{Math.floor(s.e)}
{Math.floor(s.f)}
{Math.floor(s.g)}
{Math.floor(s.h)}
{Math.floor(s.i)}
{Math.floor(s.j)}
{Math.floor(s.k)}
{Math.floor(s.l)}
{Math.floor(s.m)}
{Math.floor(s.n)}
{Math.floor(s.o)}
{Math.floor(s.p)}
{Math.floor(s.q)}
{Math.floor(s.r)}
{Math.floor(s.s)}
{Math.floor(s.t)}
{Math.floor(s.u)}
{Math.floor(s.v)}
{Math.floor(s.w)}
{Math.floor(s.x)}
{Math.floor(s.y)}
{Math.floor(s.z)}

<br />
{Math.floor(s.a)}
{Math.floor(s.b)}
{Math.floor(s.c)}
{Math.floor(s.d)}
{Math.floor(s.e)}
{Math.floor(s.f)}
{Math.floor(s.g)}
{Math.floor(s.h)}
{Math.floor(s.i)}
{Math.floor(s.j)}
{Math.floor(s.k)}
{Math.floor(s.l)}
{Math.floor(s.m)}
{Math.floor(s.n)}
{Math.floor(s.o)}
{Math.floor(s.p)}
{Math.floor(s.q)}
{Math.floor(s.r)}
{Math.floor(s.s)}
{Math.floor(s.t)}
{Math.floor(s.u)}
{Math.floor(s.v)}
{Math.floor(s.w)}
{Math.floor(s.x)}
{Math.floor(s.y)}
{Math.floor(s.z)}

<br />
{Math.floor(s.a)}
{Math.floor(s.b)}
{Math.floor(s.c)}
{Math.floor(s.d)}
{Math.floor(s.e)}
{Math.floor(s.f)}
{Math.floor(s.g)}
{Math.floor(s.h)}
{Math.floor(s.i)}
{Math.floor(s.j)}
{Math.floor(s.k)}
{Math.floor(s.l)}
{Math.floor(s.m)}
{Math.floor(s.n)}
{Math.floor(s.o)}
{Math.floor(s.p)}
{Math.floor(s.q)}
{Math.floor(s.r)}
{Math.floor(s.s)}
{Math.floor(s.t)}
{Math.floor(s.u)}
{Math.floor(s.v)}
{Math.floor(s.w)}
{Math.floor(s.x)}
{Math.floor(s.y)}
{Math.floor(s.z)}

<br />
{Math.floor(s.a)}
{Math.floor(s.b)}
{Math.floor(s.c)}
{Math.floor(s.d)}
{Math.floor(s.e)}
{Math.floor(s.f)}
{Math.floor(s.g)}
{Math.floor(s.h)}
{Math.floor(s.i)}
{Math.floor(s.j)}
{Math.floor(s.k)}
{Math.floor(s.l)}
{Math.floor(s.m)}
{Math.floor(s.n)}
{Math.floor(s.o)}
{Math.floor(s.p)}
{Math.floor(s.q)}
{Math.floor(s.r)}
{Math.floor(s.s)}
{Math.floor(s.t)}
{Math.floor(s.u)}
{Math.floor(s.v)}
{Math.floor(s.w)}
{Math.floor(s.x)}
{Math.floor(s.y)}
{Math.floor(s.z)}

<br />
{Math.floor(s.a)}
{Math.floor(s.b)}
{Math.floor(s.c)}
{Math.floor(s.d)}
{Math.floor(s.e)}
{Math.floor(s.f)}
{Math.floor(s.g)}
{Math.floor(s.h)}
{Math.floor(s.i)}
{Math.floor(s.j)}
{Math.floor(s.k)}
{Math.floor(s.l)}
{Math.floor(s.m)}
{Math.floor(s.n)}
{Math.floor(s.o)}
{Math.floor(s.p)}
{Math.floor(s.q)}
{Math.floor(s.r)}
{Math.floor(s.s)}
{Math.floor(s.t)}
{Math.floor(s.u)}
{Math.floor(s.v)}
{Math.floor(s.w)}
{Math.floor(s.x)}
{Math.floor(s.y)}
{Math.floor(s.z)}

<br />
{Math.floor(s.a)}
{Math.floor(s.b)}
{Math.floor(s.c)}
{Math.floor(s.d)}
{Math.floor(s.e)}
{Math.floor(s.f)}
{Math.floor(s.g)}
{Math.floor(s.h)}
{Math.floor(s.i)}
{Math.floor(s.j)}
{Math.floor(s.k)}
{Math.floor(s.l)}
{Math.floor(s.m)}
{Math.floor(s.n)}
{Math.floor(s.o)}
{Math.floor(s.p)}
{Math.floor(s.q)}
{Math.floor(s.r)}
{Math.floor(s.s)}
{Math.floor(s.t)}
{Math.floor(s.u)}
{Math.floor(s.v)}
{Math.floor(s.w)}
{Math.floor(s.x)}
{Math.floor(s.y)}
{Math.floor(s.z)}

<br />
{Math.floor(s.a)}
{Math.floor(s.b)}
{Math.floor(s.c)}
{Math.floor(s.d)}
{Math.floor(s.e)}
{Math.floor(s.f)}
{Math.floor(s.g)}
{Math.floor(s.h)}
{Math.floor(s.i)}
{Math.floor(s.j)}
{Math.floor(s.k)}
{Math.floor(s.l)}
{Math.floor(s.m)}
{Math.floor(s.n)}
{Math.floor(s.o)}
{Math.floor(s.p)}
{Math.floor(s.q)}
{Math.floor(s.r)}
{Math.floor(s.s)}
{Math.floor(s.t)}
{Math.floor(s.u)}
{Math.floor(s.v)}
{Math.floor(s.w)}
{Math.floor(s.x)}
{Math.floor(s.y)}
{Math.floor(s.z)}

<br />
{Math.floor(s.a)}
{Math.floor(s.b)}
{Math.floor(s.c)}
{Math.floor(s.d)}
{Math.floor(s.e)}
{Math.floor(s.f)}
{Math.floor(s.g)}
{Math.floor(s.h)}
{Math.floor(s.i)}
{Math.floor(s.j)}
{Math.floor(s.k)}
{Math.floor(s.l)}
{Math.floor(s.m)}
{Math.floor(s.n)}
{Math.floor(s.o)}
{Math.floor(s.p)}
{Math.floor(s.q)}
{Math.floor(s.r)}
{Math.floor(s.s)}
{Math.floor(s.t)}
{Math.floor(s.u)}
{Math.floor(s.v)}
{Math.floor(s.w)}
{Math.floor(s.x)}
{Math.floor(s.y)}
{Math.floor(s.z)}

<br />
{Math.floor(s.a)}
{Math.floor(s.b)}
{Math.floor(s.c)}
{Math.floor(s.d)}
{Math.floor(s.e)}
{Math.floor(s.f)}
{Math.floor(s.g)}
{Math.floor(s.h)}
{Math.floor(s.i)}
{Math.floor(s.j)}
{Math.floor(s.k)}
{Math.floor(s.l)}
{Math.floor(s.m)}
{Math.floor(s.n)}
{Math.floor(s.o)}
{Math.floor(s.p)}
{Math.floor(s.q)}
{Math.floor(s.r)}
{Math.floor(s.s)}
{Math.floor(s.t)}
{Math.floor(s.u)}
{Math.floor(s.v)}
{Math.floor(s.w)}
{Math.floor(s.x)}
{Math.floor(s.y)}
{Math.floor(s.z)}

<br />
{Math.floor(s.a)}
{Math.floor(s.b)}
{Math.floor(s.c)}
{Math.floor(s.d)}
{Math.floor(s.e)}
{Math.floor(s.f)}
{Math.floor(s.g)}
{Math.floor(s.h)}
{Math.floor(s.i)}
{Math.floor(s.j)}
{Math.floor(s.k)}
{Math.floor(s.l)}
{Math.floor(s.m)}
{Math.floor(s.n)}
{Math.floor(s.o)}
{Math.floor(s.p)}
{Math.floor(s.q)}
{Math.floor(s.r)}
{Math.floor(s.s)}
{Math.floor(s.t)}
{Math.floor(s.u)}
{Math.floor(s.v)}
{Math.floor(s.w)}
{Math.floor(s.x)}
{Math.floor(s.y)}
{Math.floor(s.z)}

<br />
{Math.floor(s.a)}
{Math.floor(s.b)}
{Math.floor(s.c)}
{Math.floor(s.d)}
{Math.floor(s.e)}
{Math.floor(s.f)}
{Math.floor(s.g)}
{Math.floor(s.h)}
{Math.floor(s.i)}
{Math.floor(s.j)}
{Math.floor(s.k)}
{Math.floor(s.l)}
{Math.floor(s.m)}
{Math.floor(s.n)}
{Math.floor(s.o)}
{Math.floor(s.p)}
{Math.floor(s.q)}
{Math.floor(s.r)}
{Math.floor(s.s)}
{Math.floor(s.t)}
{Math.floor(s.u)}
{Math.floor(s.v)}
{Math.floor(s.w)}
{Math.floor(s.x)}
{Math.floor(s.y)}
{Math.floor(s.z)}

<br />
{Math.floor(s.a)}
{Math.floor(s.b)}
{Math.floor(s.c)}
{Math.floor(s.d)}
{Math.floor(s.e)}
{Math.floor(s.f)}
{Math.floor(s.g)}
{Math.floor(s.h)}
{Math.floor(s.i)}
{Math.floor(s.j)}
{Math.floor(s.k)}
{Math.floor(s.l)}
{Math.floor(s.m)}
{Math.floor(s.n)}
{Math.floor(s.o)}
{Math.floor(s.p)}
{Math.floor(s.q)}
{Math.floor(s.r)}
{Math.floor(s.s)}
{Math.floor(s.t)}
{Math.floor(s.u)}
{Math.floor(s.v)}
{Math.floor(s.w)}
{Math.floor(s.x)}
{Math.floor(s.y)}
{Math.floor(s.z)}

<br />
{Math.floor(s.a)}
{Math.floor(s.b)}
{Math.floor(s.c)}
{Math.floor(s.d)}
{Math.floor(s.e)}
{Math.floor(s.f)}
{Math.floor(s.g)}
{Math.floor(s.h)}
{Math.floor(s.i)}
{Math.floor(s.j)}
{Math.floor(s.k)}
{Math.floor(s.l)}
{Math.floor(s.m)}
{Math.floor(s.n)}
{Math.floor(s.o)}
{Math.floor(s.p)}
{Math.floor(s.q)}
{Math.floor(s.r)}
{Math.floor(s.s)}
{Math.floor(s.t)}
{Math.floor(s.u)}
{Math.floor(s.v)}
{Math.floor(s.w)}
{Math.floor(s.x)}
{Math.floor(s.y)}
{Math.floor(s.z)}
