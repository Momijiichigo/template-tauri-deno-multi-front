import { config } from 'https://deno.land/x/dotenv/mod.ts'

config({
  export: true
})
// Deno.chdir(`front/${Deno.env.get('FRONT_FRAMEWROK')}`)
const FRONT_FRAMEWORK = Deno.env.get('FRONT_FRAMEWROK')
console.log(Deno.args)
//
// deno run -A --unstable --node-modules-dir npm:@tauri-apps/cli@next
const command = new Deno.Command('deno', {
  args: [
    'run',
    '--unstable',
    'npm:@tauri-apps/cli@next',
    ...Deno.args,
    `--config=${
      JSON.stringify({
        build: {
          beforeDevCommand: `cd front/${FRONT_FRAMEWORK} && deno run -A --node-modules-dir npm:vite`,
          beforeBuildCommand: `cd front/${FRONT_FRAMEWORK} && deno run -A --node-modules-dir npm:vite build`,
          distDir: `../front/${FRONT_FRAMEWORK}/dist`,
        }
      })
    }`,
  ]
})

command.spawn()

const { success } = await command.output()

console.log(success)
