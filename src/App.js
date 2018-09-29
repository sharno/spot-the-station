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

type Props = {};
type State = {
  urls: { [number]: { name: string, url: string } },
  spottings: Map<string, string[]>,
  duration: number,
  loading: boolean
};

const chrome = window.chrome;

export default class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      urls: {
        Cairo:
          "https://spotthestation.nasa.gov/sightings/xml_files/Egypt_None_Cairo.xml",
        "": ""
      },
      spottings: new Map([["Cairo", []]]),
      duration: 3,
      loading: true
    };
  }

  componentDidMount() {
    chrome.storage.sync.get(["urls", "duration"], ({ urls, duration }) => {
      console.log(urls, duration);
      if (urls && duration) {
        this.setState({ urls, duration });
      }
      this.updateSpottings();
    });
    setTimeout(this.updateSpottings, 1000 * 60 * 60);
  }

  updateSpottings = async () => {
    const spottings = new Map(
      await getSpottings(this.state.urls, this.state.duration)
    );
    console.log(this.state.urls, this.state.duration, spottings);
    this.setState({ spottings });
  };

  render() {
    const { duration, urls, spottings, loading } = this.state;
    return (
      <Grid padded>
        {loading === 0 ? (
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
              {[...spottings.entries()].map(([name, spots]) => (
                <List.Item as="li">
                  {name}
                  <List.List>
                    {spots.map(s => (
                      <List.Item icon="space shuttle" content={s} />
                    ))}
                  </List.List>
                </List.Item>
              ))}
            </List>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
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
        </Grid.Row>
        <Grid.Row>
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
        </Grid.Row>
      </Grid>
    );
  }
}

function getSpottings(
  urls: { [string]: string },
  duration: number
): Promise<[string, string[]][]> {
  const spottings: Promise<[string, string[]]>[] = [...Object.keys(urls)].map(
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
