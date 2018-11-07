# cmi5-assignable-unit-app-example
An example CMI5 assignable unit that connects to an LMS (the XAPI backend of an LMS) and reads/writes an xapi statement

## USAGE

...this is a temporarily valid URL for initial test (includes a nonced access_token)


http://qa-pal.ict.usc.edu/cmi5/?fetch=http://qa-pal.ict.usc.edu/api/1.0/cmi5/accesstoken2basictoken?access_token=8847d000-dba3-11e8-a05b-c40010c9cc01&endpoint=http://qa-pal.ict.usc.edu/api/1.0/cmi5/&activityId=http://pal.ict.usc.edu/activities/claire-the-counselor&registration=957f56b7-1d34-4b01-9408-3ffeb2053b28&actor=%7B%22objectType%22:%20%22Agent%22,%22name%22:%20%22clairelearner1%22,%22account%22:%20%7B%22homePage%22:%20%22http://pal.ict.usc.edu/xapi/users%22,%22name%22:%20%225bd749146b66c40010c9cc01%22%7D%7D

...using the above or a newly constructed valid url (see below for breakdown of how to construct a url), the following scenario is supported:

#### SCENARIO:

**User changes their 'commitment' level, and on subsequent visit, sees that their last saved 'commitment' level is preset**()

* Load the a index.html with valid cmi5 params in a browser
* The page should give feedback that it is first initializing cmi5 and then looking up saved ‘commitment’ state from XAPI endpoints
* The page should present radio options for commitment and a save button
* If you change commitment and then refresh the page, it should have the last-selected radio option checked

## CMI5 url params / constructing a valid url

See the [cmi5 spec](https://github.com/AICC/CMI-5_Spec_Current/blob/quartz/cmi5_spec.md#81-launch-method) for details about 'LMS launches Assignable Unit' launch urls

In a production deployment, the LMS will launch the AU app providing valid values for all of the required params in the spec.

#### Constructing a (test) CMI url for your own Assignable Unit app

The query params in the example url above can be applied to any CMI5 assignable-unit url and should work. Basically, they log you in as PAL3 user 'clairelearner1' (again for only as long as the access token remains valid).

## Included files in the example

* cmi5.js - this is a Assignable Unit client library developed by Rustici software. You will need to include this in your own AU
* index.html - this is the full html code and js for the app-specific parts of this example

## A very pared down version of the example

```html
<html>
<head>
  <!-- include the cmi5.js lib -->
  <script type="text/javascript" src="cmi5.js"></script>
</head>
<body>
  <script type="text/javascript">
    // create a CMI5 instance with the loaded url
    //(will parse all the cmi query params)
    // in a real-world example, maybe check for cmi params and
    // don't bother to do any of the below if the caller isn't using cmi
    const cmi = new Cmi5(location.href)

    // call Cmi5::start and then wait for callback
    cmi.start(function(err, result) {
      if(err) {
        // if cmi failed, there won't be a connection
        return
      }

      // if you want to load previous xapi statements you can do that here.
      // index.html has an example of this

      // when/where you are ready to send a result,
      // you can use the Cmi5 instance
      // to send one of the standard cmi verbs, e.g. passed
      // NOTE: this should NOT be happening automatically on callback from cmi::start
      cmi.passed({
        min: 1,
        max: 6,
        raw: Number(commitment)
      })

      // ...or if you prefer to store other types of xapi statements
      // (not the standard cmi verbs), use cmi.getLRS(),
      // which returns an instance of TinCan.getLRS
      // @see http://rusticisoftware.github.io/TinCanJS/doc/api/latest/classes/TinCan.LRS.html
    })
  </script>
</body>
</html>


```

#### NOTE on the all-in-one structure of index.html

It would be better if this example were a template of a modern approach to building a web app, e.g. browserify or webpack. It turned out to be difficult to browserify the example because Rustici has taken down the source code for their cmi5.js lib from public github. The cmi5.js we have is taken from [this npm package](https://www.npmjs.com/package/cmi5.js) but the package includes only the already bundled cmi5.js file, not the source.

#### NOTE on the use of the 'passed' verb

The example is using the cmi5 ‘passed’ verb to stored user’s commitment. It would be possible to save statements with any object/activity-type and verb that you might want, but the code is simpler and more concise if we use one of the cmi5 ‘standard’ verbs (see the [verb section](https://github.com/AICC/CMI-5_Spec_Current/blob/quartz/cmi5_spec.md#93-verbs) of the cmi5 spec.
