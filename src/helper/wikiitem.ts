// A helper function to shrink a wiki item to only the relevant properties
// This is used to reduce the size of the item before storing it in the database
// The function takes a wiki item as input and returns a shrunk version of the item

interface ShrunkWikiItem {
  id: number;
  name: string;
  description: string;
  alias: string;
  location?: { latitude: number; longitude: number };
  claims: Record<string, string[]>;
}

export function shrinkWikiItem(item: any): ShrunkWikiItem {

  // Combine all the aliases into a single string
  const aliases = item.aliases?.en ? item.aliases.en.map((a: any) => a.value).join(', ') : '';
  let location;

  // Claims - extract the relevant properties
  const claims = item.claims || {};
  // Variable to hold extracted claim values
  const claimValues: Record<string, string[]> = {};

  // Loop through claims and extract values as needed
  for (const prop in claims) {
    const propClaimValues = claims[prop]
    for (const cv of propClaimValues) {
      const v = cv.mainsnak?.datavalue?.value;
      if (!v) { continue; } // Cases where the value is "unknown value" or "no value".
      if (!claimValues[prop]) { claimValues[prop] = []; } // Initialize array if not present
      if (typeof v === 'string') {
        claimValues[prop].push(v);
      } else if (v.latitude && v.longitude) {
        location = { latitude: v.latitude, longitude: v.longitude };
      } else if (v.amount) {
        claimValues[prop].push(v.amount);
      }
      else if (v.id) {
        claimValues[prop].push(v.id);
      }
    }
  }
  // Delete the 'P2' property, as this is the location which we are handling separately
  delete claimValues['P2'];

  // console.log('Claim Values:', claimValues);

  return {
    id: wikiItemToNumber(item.id),
    // name (append all the aliases seperated by space)
    name: `${item.labels?.en?.value || ''} ${aliases ?? ''}`.trim(),
    description: item.descriptions?.en?.value || '',
    alias: aliases,
    location,
    claims: claimValues,
  };
}

export function wikiItemToNumber(itemId: string): number {
  itemId = itemId.replace('Q', '');
  return parseInt(itemId, 10);
}

if (import.meta.main) {
  const wikiItemExample = JSON.parse(`
{"pageid":2547,"ns":120,"title":"Item:Q2517",
"lastrevid":9445,"modified":"2025-09-14T04:50:16Z","type":"item","id":"Q2517",
"labels":{"en":{"language":"en","value":"Shri Digambar Jain Atishay Kshetra"}},
"aliases":{"en":[{"language":"en","value":"Thana"}]},
"descriptions":{"en":{"language":"en","value":", Piplon Kalan, Madhya Pradesh"}},
"claims":{
  "P1":[{"mainsnak":{"snaktype":"value","property":"P1","hash":"dad80ce021597708e456b39bc26c8f08f3771429","datavalue":{"value":{"entity-type":"item","numeric-id":3,"id":"Q3"},"type":"wikibase-entityid"},"datatype":"wikibase-item"},"type":"statement","id":"Q2517$F01003F2-B197-4B9E-AF07-0A42D213968B","rank":"normal"}],
  "P4":[{"mainsnak":{"snaktype":"value","property":"P4","hash":"45bf74773a48820704cad10ff65900d4e07e2be5","datavalue":{"value":{"entity-type":"item","numeric-id":57,"id":"Q57"},"type":"wikibase-entityid"},"datatype":"wikibase-item"},"type":"statement","id":"Q2517$CA63FF55-9E31-45E1-BC81-62A6A9530847","rank":"normal"},{"mainsnak":{"snaktype":"value","property":"P4","hash":"662c8ed277b26c470d32c577db063705e44296e4","datavalue":{"value":{"entity-type":"item","numeric-id":2221,"id":"Q2221"},"type":"wikibase-entityid"},"datatype":"wikibase-item"},"type":"statement","id":"Q2517$6DA69B90-7A0E-48E9-87D0-4F295E2E6F0C","rank":"normal"}],
  "P5":[{"mainsnak":{"snaktype":"value","property":"P5","hash":"d981637d078234380bf6e11b6732b1f0fd55f367","datavalue":{"value":"https://maps.google.com/?cid=16252235735337872888","type":"string"},"datatype":"url"},"type":"statement","id":"Q2517$14E67574-D03E-45AE-8929-4CB2AE32E922","rank":"normal"}],
  "P28":[{"mainsnak":{"snaktype":"value","property":"P28","hash":"982ba8ea8d44050d119b70c19852ac7b681cfaf0","datavalue":{"value":{"amount":"+36","unit":"1"},"type":"quantity"},"datatype":"quantity"},"type":"statement","qualifiers":{"P29":[{"snaktype":"value","property":"P29","hash":"2e81e27028742ffa0b5856a87cd6bc7656767616","datavalue":{"value":{"time":"+2025-09-05T00:00:00Z","timezone":0,"before":0,"after":0,"precision":11,"calendarmodel":"http://www.wikidata.org/entity/Q1985727"},"type":"time"},"datatype":"time"}]},"qualifiers-order":["P29"],"id":"Q2517$13D86686-92B7-446A-A35E-A4A4091BFA7F","rank":"normal"}],
  "P14":[{"mainsnak":{"snaktype":"value","property":"P14","hash":"7d324774e63d3912d5cbc57e17bf83e84c827e6e","datavalue":{"value":"JVRF+QCJ, Piplon Kalan, Madhya Pradesh 465441, India","type":"string"},"datatype":"string"},"type":"statement","id":"Q2517$8A235412-8F32-4908-B757-B438D4FE8EB8","rank":"normal"}],"P15":[{"mainsnak":{"snaktype":"value","property":"P15","hash":"0ac9c688ccba538454ab030a3b52df54987b21ef","datavalue":{"value":"465441","type":"string"},"datatype":"string"},"type":"statement","id":"Q2517$95D54313-6B63-4534-BE99-994AA7285B86","rank":"normal"}],
  "P2":[{"mainsnak":{"snaktype":"value","property":"P2","hash":"5c21f1f2ef6fe97b84adc47371e6c77b30b43ba5","datavalue":{"value":{"latitude":23.641955,"longitude":75.873522,"altitude":null,"precision":0.000001,"globe":"http://www.wikidata.org/entity/Q2"},"type":"globecoordinate"},"datatype":"globe-coordinate"},"type":"statement","id":"Q2517$0F38B083-C1C8-4BAA-A7FB-AEB04FD2CFEB","rank":"normal"}],"P25":[{"mainsnak":{"snaktype":"value","property":"P25","hash":"657a2a17a0d25d8bb4547a3d655c7dc06a4ff33c","datavalue":{"value":"ChIJ5XixAxmFZDkR-C25EkuKi-E","type":"string"},"datatype":"external-id"},"type":"statement","id":"Q2517$2FC2E6F3-5848-4CBB-81CD-521325C54EB7","rank":"normal"}],"P7":[{"mainsnak":{"snaktype":"value","property":"P7","hash":"aecace311e2eb42b41d7c70eaeba2c42a890045a","datavalue":{"value":{"entity-type":"item","numeric-id":1,"id":"Q1"},"type":"wikibase-entityid"},"datatype":"wikibase-item"},"type":"statement","id":"Q2517$911C05F6-07B9-4C9F-83DA-2902E8558C8A","rank":"normal"}],"P16":[{"mainsnak":{"snaktype":"value","property":"P16","hash":"c3535818ce9d179c3b257aa9d555b61e33d12439","datavalue":{"value":{"entity-type":"item","numeric-id":8,"id":"Q8"},"type":"wikibase-entityid"},"datatype":"wikibase-item"},"type":"statement","id":"Q2517$0909CB3F-D1A3-4F2C-B66A-AFE44B30885E","rank":"normal"}]},"sitelinks":{}}
`);
  console.log(shrinkWikiItem(wikiItemExample));
}