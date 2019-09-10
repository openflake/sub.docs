---
# DOCUMENT SUMMARY
---

{% for post in site.pages %}
  {% assign name = "/" | append: post.name %}
  {% assign folder = post.path | remove: name | upcase %}
  {% unless folder == "SUMMARY.MD" %}
  {% if currfolder != folder %}
  {% assign currfolder = folder %}
##### {{ folder }}
  {% endif %}
  <div><a data-href="#{{ post.url}}">{{ post.title }}</a></div>
  {% endunless %}
{% endfor %}
