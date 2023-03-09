import { config } from 'https://deno.land/x/dotenv/mod.ts'

config({
  export: true
})
Deno.chdir(`front/${Deno.env.get('FRONT_FRAMEWROK')}`)

const command = new Deno.Command('pnpm', {
  args: [
    'build',
  ]
})

command.spawn()

const { success } = await command.output()

console.log(success)
