// @flow
import * as React from "react";
import {
  Button,
  Input,
  Grid,
  Dimmer,
  Loader,
  Header,
  List,
  Form
} from "semantic-ui-react";
import "semantic-ui-css/semantic.css";

const chrome = window.chrome;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cities: [
        {
          name: "Cairo",
          url: "https://spotthestation.nasa.gov/sightings/xml_files/Egypt_None_Cairo.xml",
          response: `<?xml version="1.0" encoding="utf-8"?>
          <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
            <channel>
            <title>SpotTheStation - Sightings for Cairo</title>
            <link>https://spotthestation.nasa.gov/sightings/view.cfm?country=Egypt&amp;region=None&amp;city=Cairo</link>
            <description>Satellite Sightings Information for Cairo</description>
            <language>en-us</language>
            <pubDate>29 Sep 2018 00:05:01 GMT</pubDate>
            <lastBuildDate>29 Sep 2018 00:05:01 GMT</lastBuildDate>
            <managingEditor>HQ-spotthestation@mail.nasa.gov</managingEditor>
            <webMaster>HQ-spotthestation@mail.nasa.gov</webMaster>
            <atom:link href="https://spotthestation.nasa.gov/sightings/view.cfm?country=Egypt&amp;region=None&amp;city=Cairo" rel="self" type="application/rss+xml" />
                <item>
          <title>2018-10-09 ISS Sighting</title>
          <pubDate>29 Sep 2018 00:05:01 GMT</pubDate>
          <description>
          Date: Tuesday Oct 9, 2018 &lt;br/&gt;
          Time: 6:43 PM &lt;br/&gt;
          Duration: less than  1 minute &lt;br/&gt;
          Maximum Elevation: 11&#176; &lt;br/&gt;
          Approach: 10&#176; above N &lt;br/&gt;
          Departure: 11&#176; above NNE &lt;br/&gt;
          </description>
          <guid>https://spotthestation.nasa.gov/sightings/view.cfm?country=Egypt&amp;region=None&amp;city=Cairo&amp;ss=5A6D8085-9A4D-8218-93B11A11527EC4EF</guid>
          </item> 			<item>
          <title>2018-10-10 ISS Sighting</title>
          <pubDate>29 Sep 2018 00:05:01 GMT</pubDate>
          <description>
          Date: Wednesday Oct 10, 2018 &lt;br/&gt;
          Time: 7:26 PM &lt;br/&gt;
          Duration: less than  1 minute &lt;br/&gt;
          Maximum Elevation: 16&#176; &lt;br/&gt;
          Approach: 11&#176; above NW &lt;br/&gt;
          Departure: 16&#176; above NW &lt;br/&gt;
          </description>
          <guid>https://spotthestation.nasa.gov/sightings/view.cfm?country=Egypt&amp;region=None&amp;city=Cairo&amp;ss=5A6D8086-CB79-E993-6EEF8E946B7314D4</guid>
          </item> 			<item>
          <title>2018-10-11 ISS Sighting</title>
          <pubDate>29 Sep 2018 00:05:01 GMT</pubDate>
          <description>
          Date: Thursday Oct 11, 2018 &lt;br/&gt;
          Time: 6:35 PM &lt;br/&gt;
          Duration: 3 minutes &lt;br/&gt;
          Maximum Elevation: 28&#176; &lt;br/&gt;
          Approach: 11&#176; above NNW &lt;br/&gt;
          Departure: 28&#176; above NE &lt;br/&gt;
          </description>
          <guid>https://spotthestation.nasa.gov/sightings/view.cfm?country=Egypt&amp;region=None&amp;city=Cairo&amp;ss=5A6D8087-EBC6-D629-27F3362685E49364</guid>
          </item> 			<item>
          <title>2018-10-12 ISS Sighting</title>
          <pubDate>29 Sep 2018 00:05:01 GMT</pubDate>
          <description>
          Date: Friday Oct 12, 2018 &lt;br/&gt;
          Time: 5:46 PM &lt;br/&gt;
          Duration: 1 minute &lt;br/&gt;
          Maximum Elevation: 15&#176; &lt;br/&gt;
          Approach: 15&#176; above NE &lt;br/&gt;
          Departure: 11&#176; above ENE &lt;br/&gt;
          </description>
          <guid>https://spotthestation.nasa.gov/sightings/view.cfm?country=Egypt&amp;region=None&amp;city=Cairo&amp;ss=5A6D8088-CE6F-3B4F-0BB30AA59BC36C7E</guid>
          </item> 			<item>
          <title>2018-10-12 ISS Sighting</title>
          <pubDate>29 Sep 2018 00:05:01 GMT</pubDate>
          <description>
          Date: Friday Oct 12, 2018 &lt;br/&gt;
          Time: 7:20 PM &lt;br/&gt;
          Duration: less than  1 minute &lt;br/&gt;
          Maximum Elevation: 28&#176; &lt;br/&gt;
          Approach: 20&#176; above WNW &lt;br/&gt;
          Departure: 28&#176; above W &lt;br/&gt;
          </description>
          <guid>https://spotthestation.nasa.gov/sightings/view.cfm?country=Egypt&amp;region=None&amp;city=Cairo&amp;ss=5A6D8089-F785-006C-A2E662AB85EBDDE3</guid>
          </item> 	</channel></rss>
    `
        },
      ],
      duration: 3,
      loading: false
    };
  }

  componentDidMount() {
    // chrome.storage.sync.get(["urls", "duration"], ({ urls, duration }) => {
    //   console.log(urls, duration);
    //   if (urls && duration) {
    //     this.setState({ urls, duration });
    //   }
    //   this.updateSpottings();
    // });
    // setTimeout(this.updateSpottings, 1000 * 60 * 60);
    this.setState({
      cities:
        this.state.cities.map(city => ({
          ...city,
          sightings: parseResponse(city.response)
        }))
    }
      , () => console.log(this.state.cities));

  }

  updateSpottings = async () => {
    const spottings = new Map(
      await getSightings(this.state.urls, this.state.duration)
    );
    console.log(this.state.urls, this.state.duration, spottings);
    this.setState({ spottings });
  };

  render() {
    const { cities, loading } = this.state;
    return (
      <Grid padded>
        {loading ? (
          <Dimmer active>
            <Loader />
          </Dimmer>
        ) : null}
        <Grid.Row>
          <Grid.Column textAlign="center">
            <Header as="h2">Spot the station</Header>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <List as="ul">
              {cities.map(city => (
                <List.Item as="li">
                  {city.name}
                  {city.sightings ? city.sightings.map(s =>
                    <List as="ol">
                      <List.Item>
                        {s.text}
                        {s.duration}
                      </List.Item>
                    </List>
                  ) : null}
                </List.Item>
              ))}
            </List>
          </Grid.Column>
        </Grid.Row>
        {/* <Grid.Row>
          <Grid.Column>
            <Form>
              <Form.Field>
                <label>Minimum Duration</label>
                <Input
                  fluid
                  type="number"
                  label={{ basic: true, content: "minutes" }}
                  labelPosition="right"
                  placeholder="Min Duration"
                  value={this.state.duration}
                  onChange={(_, { value }) => {
                    this.setState({ duration: +value });
                  }}
                />
              </Form.Field>
              {[...Object.keys(urls)].map(name => (
                <Form.Group widths="equal">
                  <Form.Input
                    fluid
                    label="Name"
                    placeholder="Name"
                    value={name}
                    onChange={(_, { value }) => {
                      this.setState({
                        urls: { ...urls, [value]: urls[name] }
                      });
                    }}
                  />
                  <Form.Input
                    fluid
                    label="RSS URL"
                    placeholder="RSS URL"
                    value={urls[name]}
                    onChange={(_, { value }) => {
                      this.setState({
                        urls: { ...urls, [name]: value }
                      });
                    }}
                  />
                </Form.Group>
              ))}
            </Form>
          </Grid.Column>
        </Grid.Row> */}
        {/* <Grid.Row>
          <Grid.Column>
            <Button
              onClick={() => {
                chrome.storage.sync.set({ urls, duration }, () => {
                  this.updateSpottings();
                });
              }}
            >
              Save
            </Button>
          </Grid.Column>
        </Grid.Row> */}
      </Grid>
    );
  }
}

function getSightings(
  urls,
  duration
) {
  const spottings = [...Object.keys(urls)].map(
    async name => [
      name,
      await fetch(urls[name])
        .then(response => response.text())
        .then(bodyText => {
          const xmlDoc = new DOMParser().parseFromString(bodyText, "text/xml");
          const ss = [...xmlDoc.getElementsByTagName("description")]
            .map(s => s.innerHTML)
            .filter(s => /.*Duration: \d+.*/i.test(s))
            .filter(s => {
              const matching = s.match(/.*Duration: (\d+).*/i);
              return matching && matching.length > 1
                ? +matching[1] >= duration
                : false;
            })
            .map(s => s.replace(/&lt;br\/&gt;/g, "--"));
          return ss;
        })
    ]
  );
  return Promise.all(spottings);
}

function parseResponse(response) {
  const xmlDoc = new DOMParser().parseFromString(response, "text/xml");
  const sightings = [...xmlDoc.getElementsByTagName("description")]
    .map(s => s.innerHTML)
    .filter(s => /.*Duration: \d+.*/i.test(s))
    .map(s => ({
      duration: +(s.match(/.*Duration: (\d+).*/i)[1]),
      txt: s
    }));
  console.log(sightings);
  return sightings;
}