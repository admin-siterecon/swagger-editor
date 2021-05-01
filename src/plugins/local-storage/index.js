const https = require("https")

let response_body = ""

function getPromise() {
  return new Promise((resolve, reject) => {
    let chunks_of_data = []

    https.get("https://petstore.swagger.io/v2/swagger.yaml", (response) => {

      response.on("data", (fragments) => {
        chunks_of_data.push(fragments)
      })

      response.on("end", () => {
        let response = chunks_of_data.join("\r\n")
        resolve(response.toString())
      })

      response.on("error", (error) => {
        reject(error)
      })
    })
  })
}

async function makeSynchronousRequest(request) {
  try {
    let http_promise = getPromise()
    response_body = await http_promise
    // holds response from server that is passed when Promise is resolved
  } catch(error) {
    // Promise rejected
    console.log(error)
  }
}

export const updateSpec = (ori) => (...args) => {
  ori(...args)
}

export default function (system) {
  // setTimeout runs on the next tick
  // anonymous async function to execute some code synchronously after http request
  (async function() {
    // wait to http request to finish
    await makeSynchronousRequest()
    // below code will be executed after http request is finished

    system.specActions.updateSpec(response_body)
  })()

  return {
    statePlugins: {
      spec: {
        wrapActions: {
          updateSpec
        }
      }
    }
  }
}
